"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTodayReview = exports.getTodayReview = void 0;
const progress_helpers_1 = require("../progress/progress.helpers");
const progress_repository_1 = require("../progress/progress.repository");
const review_repository_1 = require("./review.repository");
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
const getLocalDateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
].join("-");
const getTodayReview = async (userId, date = new Date()) => {
    const dateKey = getLocalDateKey(date);
    const review = await (0, review_repository_1.findDailyReviewByDateKey)(dateKey);
    if (!review) {
        throw new Error("Today's review is not available");
    }
    return {
        reviewId: `${review.reviewId}_${userId}`,
        title: review.title,
        questions: review.questions.map((question) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            helper: question.helper,
            options: question.options,
            xpReward: question.xpReward,
            order: question.order,
        })),
    };
};
exports.getTodayReview = getTodayReview;
const submitTodayReview = async (userId, reviewId, answers) => {
    const canonicalReviewId = reviewId.replace(new RegExp(`_${userId}$`), "");
    const review = await (0, review_repository_1.findDailyReviewByReviewId)(canonicalReviewId);
    if (!review) {
        throw new Error("Review not found");
    }
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.selected]));
    const results = review.questions.map((question) => {
        const selected = answerMap.get(question.id) ?? null;
        const correct = isAnswerCorrect(selected, question.correctAnswer);
        return {
            questionId: question.id,
            selected,
            correctAnswer: question.correctAnswer,
            correct,
            explanation: question.explanation,
            xpReward: correct ? question.xpReward : 0,
        };
    });
    const correctCount = results.filter((result) => result.correct).length;
    const totalQuestions = review.questions.length;
    const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    const totalReviewXp = results.reduce((sum, result) => sum + result.xpReward, 0);
    const progressDocs = await Promise.all((await (0, progress_repository_1.listUserProgress)(userId)).map(async (item) => (await (0, progress_repository_1.findUserProgress)(userId, item.courseId))));
    const xpResult = await (0, progress_helpers_1.awardXpOnce)({
        userId,
        sourceType: "review_submit",
        sourceId: canonicalReviewId,
        xp: totalReviewXp,
        progress: null,
    });
    const streakResult = await (0, progress_helpers_1.syncUserStreak)({ userId, progresses: progressDocs });
    await Promise.all(progressDocs.map(async (progress) => {
        progress.streak = streakResult.streak;
        await progress.save();
    }));
    return {
        reviewId,
        correctCount,
        totalQuestions,
        score,
        xpGained: xpResult.xpGained,
        totalXp: xpResult.totalXp,
        results: results.map(({ xpReward, ...result }) => result),
    };
};
exports.submitTodayReview = submitTodayReview;
