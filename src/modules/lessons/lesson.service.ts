import { getCourseProgress } from "../progress/progress.service";
import {
  getLessonById,
  getLessonContents,
  getLessonsForUnit,
  getQuizById,
  getQuizForLesson,
  getQuizzesForLessons,
  getQuizQuestions,
  getUnitById,
  getUnitsForCourse,
} from "./lesson.repository";

const sanitizeQuestion = (question: any) => ({
  id: question.id,
  type: question.type,
  prompt: question.prompt,
  helper: question.helper,
  options: question.options,
  xpReward: question.xpReward,
  order: question.order,
});

const getCurrentLessonId = (lessons: any[], progress: any) =>
  lessons.find(
    (lesson) =>
      progress.unlockedLessonIds.includes(lesson.id) &&
      !progress.completedLessonIds.includes(lesson.id),
  )?.id ?? null;

export const getUnitsByCourse = async (userId: string, courseId: string) => {
  const [units, progress] = await Promise.all([
    getUnitsForCourse(courseId),
    getCourseProgress(userId, courseId),
  ]);

  const unitsWithLessons = await Promise.all(
    units.map(async (unit) => {
      const lessons = await getLessonsForUnit(unit.id);
      const completedLessonCount = lessons.filter((lesson) =>
        progress.completedLessonIds.includes(lesson.id),
      ).length;
      const unlockedLessonCount = lessons.filter((lesson) =>
        progress.unlockedLessonIds.includes(lesson.id),
      ).length;

      return {
        id: unit.id,
        courseId: unit.courseId,
        title: unit.title,
        subtitle: unit.subtitle ?? "",
        description: unit.description ?? "",
        order: unit.order,
        lessonCount: lessons.length,
        completedLessonCount,
        unlockedLessonCount,
        isUnlocked: unlockedLessonCount > 0,
        isCompleted: lessons.length > 0 && completedLessonCount === lessons.length,
      };
    }),
  );

  return {
    courseId,
    units: unitsWithLessons,
  };
};

export const getLessonsByUnit = async (userId: string, unitId: string) => {
  const unit = await getUnitById(unitId);
  if (!unit) {
    throw new Error("Unit not found");
  }

  const [lessons, progress] = await Promise.all([
    getLessonsForUnit(unitId),
    getCourseProgress(userId, unit.courseId),
  ]);

  const quizzes = await getQuizzesForLessons(lessons.map((lesson) => lesson.id));
  const quizByLessonId = new Map(quizzes.map((quiz) => [quiz.lessonId, quiz]));
  const currentLessonId = getCurrentLessonId(lessons, progress);

  return lessons.map((lesson) => ({
    id: lesson.id,
    unitId: lesson.unitId,
    title: lesson.title,
    subtitle: lesson.subtitle,
    order: lesson.order,
    xpReward: lesson.xpReward,
    isCompleted: progress.completedLessonIds.includes(lesson.id),
    isUnlocked: progress.unlockedLessonIds.includes(lesson.id),
    isCurrent: lesson.id === currentLessonId,
    hasQuiz: quizByLessonId.has(lesson.id),
    quizId: quizByLessonId.get(lesson.id)?.id ?? null,
  }));
};

export const getLessonDetail = async (userId: string, lessonId: string) => {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const unit = await getUnitById(lesson.unitId);
  if (!unit) {
    throw new Error("Unit not found");
  }

  const [contents, progress, lessonsInUnit, quiz] = await Promise.all([
    getLessonContents(lessonId),
    getCourseProgress(userId, unit.courseId),
    getLessonsForUnit(lesson.unitId),
    getQuizForLesson(lessonId),
  ]);

  const currentLessonId = getCurrentLessonId(lessonsInUnit, progress);
  const currentIndex = lessonsInUnit.findIndex((item) => item.id === lessonId);
  const previousLesson = currentIndex > 0 ? lessonsInUnit[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? lessonsInUnit[currentIndex + 1] ?? null : null;

  return {
    id: lesson.id,
    unitId: lesson.unitId,
    title: lesson.title,
    subtitle: lesson.subtitle,
    order: lesson.order,
    xpReward: lesson.xpReward,
    isCompleted: progress.completedLessonIds.includes(lesson.id),
    isUnlocked: progress.unlockedLessonIds.includes(lesson.id),
    isCurrent: lesson.id === currentLessonId,
    hasQuiz: Boolean(quiz),
    quizId: quiz?.id ?? null,
    quizPassingScore: quiz?.passingScore ?? null,
    previousLessonId: previousLesson?.id ?? null,
    nextLessonId: nextLesson?.id ?? null,
    unit: {
      id: unit.id,
      courseId: unit.courseId,
      title: unit.title,
      subtitle: unit.subtitle ?? "",
      description: unit.description ?? "",
      order: unit.order,
    },
    contents: contents.map((content) => ({
      id: content.id,
      type: content.type,
      title: content.title,
      order: content.order,
      content: content.content,
    })),
  };
};

export const getLessonQuiz = async (lessonId: string) => {
  const quiz = await getQuizForLesson(lessonId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = await getQuizQuestions(quiz.id);

  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: questions.map(sanitizeQuestion),
  };
};

export const getQuizForSubmission = async (quizId: string) => {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = await getQuizQuestions(quizId);

  return { quiz, questions };
};
