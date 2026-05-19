import { applyXpChangeOnce } from "../progress/xp.service";
import { findUserById } from "../progress/progress.repository";
import {
  createPracticeAttempt,
  findAllActivePractice,
  findPracticeAttemptsByUserToday,
  findPracticeById,
} from "./practice.repository";
import { PracticeAttemptPayload } from "./practice.types";

const validateAttemptPayload = (payload: PracticeAttemptPayload) => {
  if (!Number.isFinite(payload.score) || payload.score < 0 || payload.score > 100) {
    throw new Error("Invalid score payload");
  }

  if (!Number.isInteger(payload.correctCount) || payload.correctCount < 0) {
    throw new Error("Invalid score payload");
  }

  if (!Number.isInteger(payload.totalCount) || payload.totalCount <= 0) {
    throw new Error("Invalid score payload");
  }

  if (payload.correctCount > payload.totalCount) {
    throw new Error("Correct count cannot exceed total count");
  }
};

export const listPractice = async () => {
  const practices = await findAllActivePractice();
  return practices.map((practice) => ({
    id: practice.id,
    type: practice.type,
    levelId: practice.levelId,
    title: practice.title,
    subtitle: practice.subtitle,
    description: practice.description,
    xpReward: practice.xpReward,
    maxDailyXp: practice.maxDailyXp,
    dailyAttemptLimit: practice.dailyAttemptLimit,
    order: practice.order,
  }));
};

export const getPracticeDetail = async (practiceId: string) => {
  if (!practiceId) {
    throw new Error("Practice not found");
  }

  const practice = await findPracticeById(practiceId);
  if (!practice) {
    throw new Error("Practice not found");
  }

  return {
    id: practice.id,
    type: practice.type,
    levelId: practice.levelId,
    title: practice.title,
    subtitle: practice.subtitle,
    description: practice.description,
    xpReward: practice.xpReward,
    maxDailyXp: practice.maxDailyXp,
    dailyAttemptLimit: practice.dailyAttemptLimit,
    isActive: practice.isActive,
    order: practice.order,
    config: practice.config,
    questions: practice.questions,
  };
};

export const submitPracticeAttempt = async (
  userId: string,
  practiceId: string,
  payload: PracticeAttemptPayload,
) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const practice = await findPracticeById(practiceId);
  if (!practice) {
    throw new Error("Practice not found");
  }

  if (!practice.isActive) {
    throw new Error("Practice is not active");
  }

  validateAttemptPayload(payload);

  const attemptsToday = await findPracticeAttemptsByUserToday(userId, practiceId);
  const dailyXpEarned = attemptsToday.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
  const dailyXpLimit = practice.maxDailyXp;
  const attemptsRemaining = practice.dailyAttemptLimit - attemptsToday.length;

  let xpEarned = 0;
  let xpCapped = false;

  if (attemptsRemaining <= 0 || dailyXpEarned >= dailyXpLimit) {
    xpCapped = true;
  } else {
    xpEarned = Math.min(practice.xpReward, dailyXpLimit - dailyXpEarned);
  }

  const attempt = await createPracticeAttempt({
    userId,
    practiceId,
    levelId: practice.levelId,
    score: payload.score,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    xpEarned,
  });

  if (xpEarned > 0) {
    await applyXpChangeOnce({
      userId,
      sourceType: "game_reward",
      sourceId: `practice:${practiceId}:${attempt._id.toString()}`,
      xp: xpEarned,
    });
  }

  return {
    practiceId: practice.id,
    score: payload.score,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    xpEarned,
    dailyXpEarned: dailyXpEarned + xpEarned,
    dailyXpLimit,
    xpCapped,
    message: xpCapped ? "You've reached the daily XP limit for this practice" : "Practice attempt recorded",
  };
};
