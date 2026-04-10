"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = void 0;
const learning_repository_1 = require("../learning/learning.repository");
const lesson_service_1 = require("../lessons/lesson.service");
const progress_helpers_1 = require("../progress/progress.helpers");
const progress_repository_1 = require("../progress/progress.repository");
const progress_service_1 = require("../progress/progress.service");
const normalizeAnswer = (value) => {
    if (typeof value === "string") {
        return value.trim().toLowerCase();
    }
    if (typeof value === "boolean") {
        return value;
    }
    if (value === null || value === undefined) {
        return null;
    }
    return String(value).trim().toLowerCase();
};
const isAnswerCorrect = (selected, correctAnswer) => normalizeAnswer(selected) === normalizeAnswer(correctAnswer);
const submitQuiz = async (userId, quizId, answers) => {
    const { quiz, questions } = await (0, lesson_service_1.getQuizForSubmission)(quizId);
    const lesson = await (0, learning_repository_1.findLessonById)(quiz.lessonId);
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    const unit = await (0, learning_repository_1.findUnitById)(lesson.unitId);
    if (!unit) {
        throw new Error("Unit not found");
    }
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.selected]));
    const correctCount = questions.reduce((count, question) => {
        const selected = answerMap.get(question.id);
        return count + (isAnswerCorrect(selected, question.correctAnswer) ? 1 : 0);
    }, 0);
    const totalQuestions = questions.length;
    const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;
    const progressState = await (0, progress_service_1.getCourseProgress)(userId, unit.courseId);
    const progress = progressState.document;
    const totalAvailableXp = questions.reduce((sum, question) => sum + question.xpReward, 0);
    const xpResult = passed
        ? await (0, progress_helpers_1.awardXpOnce)({
            userId,
            sourceType: "quiz_submit",
            sourceId: quizId,
            xp: Math.min(lesson.quizXpReward || totalAvailableXp, totalAvailableXp),
            progress,
        })
        : { xpGained: 0, totalXp: progress.totalXp };
    await (0, progress_repository_1.createQuizAttempt)({
        userId,
        quizId,
        lessonId: lesson.id,
        answers,
        correctCount,
        score,
        passed,
        xpAwarded: xpResult.xpGained,
    });
    const progressDocs = await Promise.all((await (0, progress_repository_1.listUserProgress)(userId)).map(async (item) => {
        if (item.courseId === progress.courseId) {
            return progress;
        }
        return (await (0, progress_repository_1.findUserProgress)(userId, item.courseId));
    }));
    const streakResult = await (0, progress_helpers_1.syncUserStreak)({ userId, progresses: progressDocs });
    if (progress.streak !== streakResult.streak) {
        progress.streak = streakResult.streak;
        await progress.save();
    }
    return {
        quizId,
        score,
        passed,
        correctCount,
        totalQuestions,
        xpGained: xpResult.xpGained,
        totalXp: progress.totalXp,
    };
};
exports.submitQuiz = submitQuiz;
