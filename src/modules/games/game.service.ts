import {
  findGameById,
  createGameAttempt,
  findGameAttemptsByUserToday,
  findGameAttemptsByUser,
} from "./game.repository";
import { applyXpChangeOnce } from "../progress/xp.service";
import { findUserById } from "../progress/progress.repository";

export const getGameDetail = async (gameId: string) => {
  const game = await findGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  return {
    id: game.id,
    type: game.type,
    levelId: game.levelId,
    title: game.title,
    subtitle: game.subtitle,
    description: game.description,
    xpReward: game.xpReward,
    maxDailyXp: game.maxDailyXp,
    dailyAttemptLimit: game.dailyAttemptLimit,
    isActive: game.isActive,
    order: game.order,
    config: game.config,
    questions: game.questions,
  };
};

export const submitGameAttempt = async (
  userId: string,
  gameId: string,
  payload: { score: number; correctCount: number; totalCount: number },
) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const game = await findGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (!game.isActive) {
    throw new Error("Game is not active");
  }

  if (payload.score < 0 || payload.correctCount < 0 || payload.totalCount <= 0) {
    throw new Error("Invalid score payload");
  }

  if (payload.correctCount > payload.totalCount) {
    throw new Error("Correct count cannot exceed total count");
  }

  // Get attempts today to check daily limit and calculate XP
  const attemptsToday = await findGameAttemptsByUserToday(userId, gameId);

  const dailyXpEarned = attemptsToday.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
  const dailyXpLimit = game.maxDailyXp;
  const attemptsRemaining = game.dailyAttemptLimit - attemptsToday.length;

  let xpEarned = 0;
  let xpCapped = false;

  if (attemptsRemaining <= 0) {
    // Daily attempt limit reached
    xpEarned = 0;
    xpCapped = true;
  } else if (dailyXpEarned >= dailyXpLimit) {
    // Daily XP cap already reached
    xpEarned = 0;
    xpCapped = true;
  } else {
    // Calculate earned XP, capped by remaining daily limit
    const earnedXpBeforeCap = game.xpReward;
    const remainingDailyXp = dailyXpLimit - dailyXpEarned;
    xpEarned = Math.min(earnedXpBeforeCap, remainingDailyXp);
  }

  // Create the attempt record
  const attempt = await createGameAttempt({
    userId,
    gameId,
    levelId: game.levelId,
    score: payload.score,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    xpEarned,
  });

  // Apply XP if earned (using sourceId to prevent duplicates)
  const sourceId = `game:${gameId}:${attempt._id.toString()}`;
  if (xpEarned > 0) {
    await applyXpChangeOnce({
      userId,
      sourceType: "game_reward",
      sourceId,
      xp: xpEarned,
    });
  }

  return {
    gameId: game.id,
    score: payload.score,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    xpEarned,
    dailyXpEarned: dailyXpEarned + xpEarned,
    dailyXpLimit,
    xpCapped,
    message: xpCapped
      ? "You've reached the daily XP limit for this game"
      : "Game attempt recorded",
  };
};
