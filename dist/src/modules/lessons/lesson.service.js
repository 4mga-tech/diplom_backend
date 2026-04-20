"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizForSubmission = exports.getLessonQuiz = exports.getLessonDetail = exports.getLessonsByUnit = exports.getUnitsByCourse = void 0;
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
const getCurrentLessonId = (lessons, progress) => lessons.find((lesson) => progress.unlockedLessonIds.includes(lesson.id) &&
    !progress.completedLessonIds.includes(lesson.id))?.id ?? null;
const getUnitsByCourse = async (userId, courseId) => {
    const [units, progress] = await Promise.all([
        (0, lesson_repository_1.getUnitsForCourse)(courseId),
        (0, progress_service_1.getCourseProgress)(userId, courseId),
    ]);
    const unitsWithLessons = await Promise.all(units.map(async (unit) => {
        const lessons = await (0, lesson_repository_1.getLessonsForUnit)(unit.id);
        const completedLessonCount = lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
        const unlockedLessonCount = lessons.filter((lesson) => progress.unlockedLessonIds.includes(lesson.id)).length;
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
    }));
    return {
        courseId,
        units: unitsWithLessons,
    };
};
exports.getUnitsByCourse = getUnitsByCourse;
const getLessonsByUnit = async (userId, unitId) => {
    const unit = await (0, lesson_repository_1.getUnitById)(unitId);
    if (!unit) {
        throw new Error("Unit not found");
    }
    const [lessons, progress] = await Promise.all([
        (0, lesson_repository_1.getLessonsForUnit)(unitId),
        (0, progress_service_1.getCourseProgress)(userId, unit.courseId),
    ]);
    const quizzes = await (0, lesson_repository_1.getQuizzesForLessons)(lessons.map((lesson) => lesson.id));
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
    const [contents, progress, lessonsInUnit, quiz] = await Promise.all([
        (0, lesson_repository_1.getLessonContents)(lessonId),
        (0, progress_service_1.getCourseProgress)(userId, unit.courseId),
        (0, lesson_repository_1.getLessonsForUnit)(lesson.unitId),
        (0, lesson_repository_1.getQuizForLesson)(lessonId),
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
