"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizForSubmission = exports.getLessonQuiz = exports.getLessonDetail = exports.getLessonsByUnit = void 0;
const progress_service_1 = require("../progress/progress.service");
const lesson_repository_1 = require("./lesson.repository");
const sanitizeQuestion = (question) => ({
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    helper: question.helper,
    options: question.options,
    xpReward: question.xpReward,
    order: question.order,
});
const getLessonsByUnit = async (userId, unitId) => {
    const unit = await (0, lesson_repository_1.getUnitById)(unitId);
    if (!unit) {
        throw new Error("Unit not found");
    }
    const [lessons, progress] = await Promise.all([
        (0, lesson_repository_1.getLessonsForUnit)(unitId),
        (0, progress_service_1.getCourseProgress)(userId, unit.courseId),
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
exports.getLessonsByUnit = getLessonsByUnit;
const getLessonDetail = async (userId, lessonId) => {
    const lesson = await (0, lesson_repository_1.getLessonById)(lessonId);
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    const unit = await (0, lesson_repository_1.getUnitById)(lesson.unitId);
    if (!unit) {
        throw new Error("Unit not found");
    }
    const [contents, progress] = await Promise.all([
        (0, lesson_repository_1.getLessonContents)(lessonId),
        (0, progress_service_1.getCourseProgress)(userId, unit.courseId),
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
exports.getLessonDetail = getLessonDetail;
const getLessonQuiz = async (lessonId) => {
    const quiz = await (0, lesson_repository_1.getQuizForLesson)(lessonId);
    if (!quiz) {
        throw new Error("Quiz not found");
    }
    const questions = await (0, lesson_repository_1.getQuizQuestions)(quiz.id);
    return {
        id: quiz.id,
        lessonId: quiz.lessonId,
        title: quiz.title,
        passingScore: quiz.passingScore,
        questions: questions.map(sanitizeQuestion),
    };
};
exports.getLessonQuiz = getLessonQuiz;
const getQuizForSubmission = async (quizId) => {
    const quiz = await (0, lesson_repository_1.getQuizById)(quizId);
    if (!quiz) {
        throw new Error("Quiz not found");
    }
    const questions = await (0, lesson_repository_1.getQuizQuestions)(quizId);
    return { quiz, questions };
};
exports.getQuizForSubmission = getQuizForSubmission;
