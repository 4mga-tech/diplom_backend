import {
  findContentsByLessonId,
  findLessonById,
  findLessonsByUnitId,
  findQuizById,
  findQuizByLessonId,
  findQuizzesByLessonIds,
  findQuizQuestionsByQuizId,
  findUnitById,
  findUnitsByCourseId,
} from "../learning/learning.repository";

export const getUnitById = findUnitById;
export const getUnitsForCourse = findUnitsByCourseId;
export const getLessonsForUnit = findLessonsByUnitId;
export const getLessonById = findLessonById;
export const getLessonContents = findContentsByLessonId;
export const getQuizForLesson = findQuizByLessonId;
export const getQuizzesForLessons = findQuizzesByLessonIds;
export const getQuizById = findQuizById;
export const getQuizQuestions = findQuizQuestionsByQuizId;
