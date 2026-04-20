import { findCourseById, findLessonById, findUnitById } from "../learning/learning.repository";
import { awardXpOnce, syncUserStreak } from "./progress.helpers";
import { getFirstLessonIdForCourse, unlockNextLesson } from "./lesson-unlock.helper";
import {
  findOrCreateUserProgress,
  findUserById,
  findUserProgress,
  listUserProgress,
} from "./progress.repository";

export const getCourseProgress = async (userId: string, courseId: string) => {
  const course = await findCourseById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const firstLessonId = await getFirstLessonIdForCourse(courseId);

  const progress = await findOrCreateUserProgress(
    userId,
    courseId,
    firstLessonId ? [firstLessonId] : [],
  );

  return {
    courseId: progress.courseId,
    completedLessonIds: progress.completedLessonIds,
    unlockedLessonIds: progress.unlockedLessonIds,
    totalXp: progress.totalXp,
    streak: progress.streak,
    document: progress,
  };
};

export const getProgressSummary = async (userId: string) => {
  const [allProgress, user] = await Promise.all([
    listUserProgress(userId),
    findUserById(userId),
  ]);

  return {
    streak: user?.streak ?? 0,
    completedLessons: allProgress.reduce(
      (sum, progress) => sum + progress.completedLessonIds.length,
      0,
    ),
    totalXp: user?.totalXP ?? 0,
  };
};

export const completeLesson = async (userId: string, lessonId: string) => {
  const lesson = await findLessonById(lessonId);
  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const unit = await findUnitById(lesson.unitId);
  if (!unit) {
    throw new Error("Unit not found");
  }

  const progressState = await getCourseProgress(userId, unit.courseId);
  const progress = progressState.document;
  const alreadyCompleted = progress.completedLessonIds.includes(lessonId);

  if (!alreadyCompleted) {
    progress.completedLessonIds.push(lessonId);
  }

  const nextLessonUnlocked = await unlockNextLesson({
    courseId: unit.courseId,
    lessonId,
    completedLessonIds: progress.completedLessonIds,
    unlockedLessonIds: progress.unlockedLessonIds,
  });

  const xpResult = alreadyCompleted
    ? { xpGained: 0, totalXp: progress.totalXp }
    : await awardXpOnce({
        userId,
        sourceType: "lesson_complete",
        sourceId: lessonId,
        xp: lesson.xpReward,
        progress,
      });

  await progress.save();

  const progressDocs = await Promise.all(
    (await listUserProgress(userId)).map(async (item) => {
      if (item.courseId === progress.courseId) {
        return progress;
      }

      return (await findUserProgress(userId, item.courseId))!;
    }),
  );

  const streakResult = await syncUserStreak({
    userId,
    progresses: progressDocs,
  });

  if (progress.streak !== streakResult.streak) {
    progress.streak = streakResult.streak;
    await progress.save();
  }

  return {
    lessonId,
    completed: true,
    xpGained: xpResult.xpGained,
    totalXp: progress.totalXp,
    nextLessonUnlocked,
  };
};
