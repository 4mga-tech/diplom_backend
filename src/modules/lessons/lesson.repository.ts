import {
  findContentsByLessonId,
  findLessonById,
  findLessonsByUnitId,
  findQuizById,
  findQuizByLessonId,
  findQuizQuestionsByQuizId,
  findUnitById,
} from "../learning/learning.repository";

export const getUnitById = findUnitById;
export const getLessonsForUnit = findLessonsByUnitId;
export const getLessonById = findLessonById;
export const getLessonContents = findContentsByLessonId;
export const getQuizForLesson = findQuizByLessonId;
export const getQuizById = findQuizById;
export const getQuizQuestions = findQuizQuestionsByQuizId;
