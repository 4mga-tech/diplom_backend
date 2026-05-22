import { applyXpChangeOnce } from "../progress/xp.service";
import { findUserById } from "../progress/progress.repository";
import {
  createPracticeAttempt,
  findAllActivePractice,
  findPracticeAttemptsByUser,
  findPracticeAttemptsByUserToday,
  findPracticeById,
} from "./practice.repository";
import { PracticeAttemptPayload, PracticeConfig, PracticeRoadmapStage } from "./practice.types";

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

  if (payload.stageId !== undefined && (typeof payload.stageId !== "string" || payload.stageId.trim().length === 0)) {
    throw new Error("Invalid stage payload");
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

const buildRoadmapWithUnlockStatus = (
  roadmap: PracticeRoadmapStage[],
  completedStageIds: Set<string>,
): PracticeRoadmapStage[] => {
  const sortedRoadmap = [...roadmap].sort((a, b) => a.order - b.order);

  return sortedRoadmap.map((stage, index) => {
    const fallbackUnlocked = Boolean(stage.isUnlocked);
    const isCompleted = completedStageIds.has(stage.id);
    const previousStage = index > 0 ? sortedRoadmap[index - 1] : undefined;
    const isUnlocked =
      index === 0 ? true : previousStage ? completedStageIds.has(previousStage.id) : fallbackUnlocked;

    return {
      ...stage,
      isUnlocked: isUnlocked ?? fallbackUnlocked,
      isCompleted,
    };
  });
};

export const getPracticeDetail = async (practiceId: string, userId?: string) => {
  if (!practiceId) {
    throw new Error("Practice not found");
  }

  const practice = await findPracticeById(practiceId);
  if (!practice) {
    throw new Error("Practice not found");
  }

  let config = practice.config;
  const roadmap = (practice.config as PracticeConfig | undefined)?.roadmap;
  if (Array.isArray(roadmap)) {
    let completedStageIds = new Set<string>();

    if (userId) {
      const attempts = await findPracticeAttemptsByUser(userId, practiceId);
      completedStageIds = new Set(
        attempts
          .filter((attempt) => Boolean(attempt.stageId) && attempt.totalCount > 0)
          .map((attempt) => String(attempt.stageId)),
      );
    }

    config = {
      ...practice.config,
      roadmap: buildRoadmapWithUnlockStatus(roadmap, completedStageIds),
    };
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
    config,
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

  const roadmap = (practice.config as PracticeConfig | undefined)?.roadmap;
  if (payload.stageId && Array.isArray(roadmap) && !roadmap.some((stage) => stage.id === payload.stageId)) {
    throw new Error("Invalid stage payload");
  }

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
    stageId: payload.stageId,
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
    stageId: payload.stageId,
    xpEarned,
    dailyXpEarned: dailyXpEarned + xpEarned,
    dailyXpLimit,
    xpCapped,
    message: xpCapped ? "You've reached the daily XP limit for this practice" : "Practice attempt recorded",
  };
};
