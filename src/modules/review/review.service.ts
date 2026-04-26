import { syncUserStreak } from "../progress/progress.helpers";
import { findUserProgress, listUserProgress } from "../progress/progress.repository";
import { AnswerPayload } from "../progress/progress.types";
import { applyXpChangeOnce } from "../progress/xp.service";
import { findDailyReviewByDateKey, findDailyReviewByReviewId } from "./review.repository";

const normalizeAnswer = (value: unknown) => {
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

const isAnswerCorrect = (selected: unknown, correctAnswer: unknown) =>
  normalizeAnswer(selected) === normalizeAnswer(correctAnswer);

const getLocalDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const getTodayReview = async (userId: string, date = new Date()) => {
  const dateKey = getLocalDateKey(date);
  const review = await findDailyReviewByDateKey(dateKey);

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

export const submitTodayReview = async (
  userId: string,
  reviewId: string,
  answers: AnswerPayload[],
) => {
  const canonicalReviewId = reviewId.replace(new RegExp(`_${userId}$`), "");
  const review = await findDailyReviewByReviewId(canonicalReviewId);

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

  const progressDocs = await Promise.all(
    (await listUserProgress(userId)).map(async (item) => (await findUserProgress(userId, item.courseId))!),
  );

  const xpResult = await applyXpChangeOnce({
    userId,
    sourceType: "review_reward",
    sourceId: canonicalReviewId,
    xp: totalReviewXp,
    progress: null,
  });

  const streakResult = await syncUserStreak({ userId, progresses: progressDocs });

  await Promise.all(
    progressDocs.map(async (progress) => {
      progress.streak = streakResult.streak;
      await progress.save();
    }),
  );

  return {
    reviewId,
    correctCount,
    totalQuestions,
    score,
    xpGained: xpResult.xpDelta,
    totalXp: xpResult.totalXp,
    results: results.map(({ xpReward, ...result }) => result),
  };
};
