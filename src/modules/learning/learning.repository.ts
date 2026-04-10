import { Course } from "./course.model";
import { Unit } from "./unit.model";
import { LearningLesson } from "./lesson.model";
import { LessonContent } from "./lesson-content.model";
import { Quiz } from "./quiz.model";
import { QuizQuestion } from "./quiz-question.model";

export const findCourseById = (courseId: string) => Course.findOne({ id: courseId }).lean();

export const findUnitById = (unitId: string) => Unit.findOne({ id: unitId }).lean();

export const findUnitsByCourseId = (courseId: string) =>
  Unit.find({ courseId }).sort({ order: 1 }).lean();

export const findLessonsByUnitId = (unitId: string) =>
  LearningLesson.find({ unitId }).sort({ order: 1 }).lean();

export const findLessonById = (lessonId: string) =>
  LearningLesson.findOne({ id: lessonId }).lean();

export const findLessonsByUnitIds = (unitIds: string[]) =>
  LearningLesson.find({ unitId: { $in: unitIds } }).sort({ order: 1 }).lean();

export const findContentsByLessonId = (lessonId: string) =>
  LessonContent.find({ lessonId }).sort({ order: 1 }).lean();

export const findQuizByLessonId = (lessonId: string) =>
  Quiz.findOne({ lessonId }).lean();

export const findQuizById = (quizId: string) => Quiz.findOne({ id: quizId }).lean();

export const findQuizQuestionsByQuizId = (quizId: string) =>
  QuizQuestion.find({ quizId }).sort({ order: 1 }).lean();

