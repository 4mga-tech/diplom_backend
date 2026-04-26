"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeLesson = exports.getProgressSummary = exports.getCourseProgress = void 0;
const learning_repository_1 = require("../learning/learning.repository");
const progress_helpers_1 = require("./progress.helpers");
const lesson_unlock_helper_1 = require("./lesson-unlock.helper");
const progress_repository_1 = require("./progress.repository");
const xp_service_1 = require("./xp.service");
const getCourseProgress = async (userId, courseId) => {
    const course = await (0, learning_repository_1.findCourseById)(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    const firstLessonId = await (0, lesson_unlock_helper_1.getFirstLessonIdForCourse)(courseId);
    const progress = await (0, progress_repository_1.findOrCreateUserProgress)(userId, courseId, firstLessonId ? [firstLessonId] : []);
    return {
        courseId: progress.courseId,
        completedLessonIds: progress.completedLessonIds,
        unlockedLessonIds: progress.unlockedLessonIds,
        totalXp: progress.totalXp,
        streak: progress.streak,
        document: progress,
    };
};
exports.getCourseProgress = getCourseProgress;
const getProgressSummary = async (userId) => {
    const [allProgress, user] = await Promise.all([
        (0, progress_repository_1.listUserProgress)(userId),
        (0, progress_repository_1.findUserById)(userId),
    ]);
    return {
        streak: user?.streak ?? 0,
        completedLessons: allProgress.reduce((sum, progress) => sum + progress.completedLessonIds.length, 0),
        totalXp: user?.totalXP ?? 0,
    };
};
exports.getProgressSummary = getProgressSummary;
const completeLesson = async (userId, lessonId) => {
    const lesson = await (0, learning_repository_1.findLessonById)(lessonId);
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    const unit = await (0, learning_repository_1.findUnitById)(lesson.unitId);
    if (!unit) {
        throw new Error("Unit not found");
    }
    const progressState = await (0, exports.getCourseProgress)(userId, unit.courseId);
    const progress = progressState.document;
    const alreadyCompleted = progress.completedLessonIds.includes(lessonId);
    if (!alreadyCompleted) {
        progress.completedLessonIds.push(lessonId);
    }
    const nextLessonUnlocked = await (0, lesson_unlock_helper_1.unlockNextLesson)({
        courseId: unit.courseId,
        lessonId,
        completedLessonIds: progress.completedLessonIds,
        unlockedLessonIds: progress.unlockedLessonIds,
    });
    const xpResult = alreadyCompleted
        ? { xpDelta: 0, totalXp: progress.totalXp }
        : await (0, xp_service_1.applyXpChangeOnce)({
            userId,
            sourceType: "lesson_study",
            sourceId: lessonId,
            xp: lesson.xpReward,
            progress,
        });
    await progress.save();
    const progressDocs = await Promise.all((await (0, progress_repository_1.listUserProgress)(userId)).map(async (item) => {
        if (item.courseId === progress.courseId) {
            return progress;
        }
        return (await (0, progress_repository_1.findUserProgress)(userId, item.courseId));
    }));
    const streakResult = await (0, progress_helpers_1.syncUserStreak)({
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
        xpGained: alreadyCompleted ? 0 : xpResult.xpDelta,
        totalXp: progress.totalXp,
        nextLessonUnlocked,
    };
};
exports.completeLesson = completeLesson;
