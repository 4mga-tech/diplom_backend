import { getCourseProgress } from "../progress/progress.service";
import {
  getLessonById,
  getLessonContents,
  getLessonsForUnit,
  getQuizById,
  getQuizForLesson,
  getQuizQuestions,
  getUnitById,
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

export const getLessonsByUnit = async (userId: string, unitId: string) => {
  const unit = await getUnitById(unitId);
  if (!unit) {
    throw new Error("Unit not found");
  }

  const [lessons, progress] = await Promise.all([
    getLessonsForUnit(unitId),
    getCourseProgress(userId, unit.courseId),
  ]);

  return lessons.map((lesson) => ({
    id: lesson.id,
    unitId: lesson.unitId,
    title: lesson.title,
    subtitle: lesson.subtitle,
    order: lesson.order,
    xpReward: lesson.xpReward,
    isCompleted: progress.completedLessonIds.includes(lesson.id),
    isUnlocked: progress.unlockedLessonIds.includes(lesson.id),
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

  const [contents, progress] = await Promise.all([
    getLessonContents(lessonId),
    getCourseProgress(userId, unit.courseId),
  ]);

  return {
    id: lesson.id,
    unitId: lesson.unitId,
    title: lesson.title,
    subtitle: lesson.subtitle,
    order: lesson.order,
    xpReward: lesson.xpReward,
    isCompleted: progress.completedLessonIds.includes(lesson.id),
    isUnlocked: progress.unlockedLessonIds.includes(lesson.id),
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
