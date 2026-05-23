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
  if (Array.isArray(payload.answers)) {
    if (payload.answers.length === 0) {
      throw new Error("Invalid answers payload");
    }

    for (const answer of payload.answers) {
      if (!answer || typeof answer.questionId !== "string" || answer.questionId.trim().length === 0) {
        throw new Error("Invalid answers payload");
      }
    }
  }

  if (payload.score === undefined || payload.correctCount === undefined || payload.totalCount === undefined) {
    if (!Array.isArray(payload.answers)) {
      throw new Error("Invalid score payload");
    }

    return;
  }

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

const normalizeAnswer = (value: unknown) => String(value ?? "").trim().toLowerCase();

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

const buildPracticeProgress = (
  roadmap: PracticeRoadmapStage[] | undefined,
  completedStageIds: Set<string>,
  earnedXp: number,
) => {
  const sortedRoadmap = Array.isArray(roadmap) ? [...roadmap].sort((a, b) => a.order - b.order) : [];
  const totalStages = sortedRoadmap.length;
  const completedStages = sortedRoadmap.filter((stage) => completedStageIds.has(stage.id)).length;
  const progressPercent = totalStages > 0 ? completedStages / totalStages : 0;

  let nextStageId: string | null = null;
  for (let index = 0; index < sortedRoadmap.length; index += 1) {
    const stage = sortedRoadmap[index];
    if (completedStageIds.has(stage.id)) {
      continue;
    }

    if (index === 0 || completedStageIds.has(sortedRoadmap[index - 1].id)) {
      nextStageId = stage.id;
      break;
    }
  }

  return {
    completedStages,
    totalStages,
    progressPercent,
    earnedXp,
    nextStageId,
  };
};

export const listPractice = async (userId: string) => {
  const practices = await findAllActivePractice();

  const listWithProgress = await Promise.all(
    practices.map(async (practice) => {
      const attempts = await findPracticeAttemptsByUser(userId, practice.id);
      const completedStageIds = new Set(
        attempts
          .filter((attempt) => Boolean(attempt.stageId) && attempt.totalCount > 0)
          .map((attempt) => String(attempt.stageId)),
      );
      const earnedXp = attempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
      const roadmap = (practice.config as PracticeConfig | undefined)?.roadmap;

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
        order: practice.order,
        progress: buildPracticeProgress(roadmap, completedStageIds, earnedXp),
      };
    }),
  );

  return listWithProgress;
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

  let evaluatedCorrectCount = payload.correctCount;
  let evaluatedTotalCount = payload.totalCount;
  let evaluatedScore = payload.score;

  if (Array.isArray(payload.answers) && payload.answers.length > 0) {
    const answerMap = new Map(payload.answers.map((answer) => [String(answer.questionId), answer.selected]));
    const shouldEvaluateByAnswer = new Set([
      "image_choice",
      "sentence_order",
      "dialogue_fill",
      "missing_word",
      "audio_choice",
    ]);

    if (shouldEvaluateByAnswer.has(practice.type)) {
      evaluatedTotalCount = practice.questions.length;
      evaluatedCorrectCount = practice.questions.reduce((count, question) => {
        const submittedAnswer = answerMap.get(question.id);
        const correctAnswer = question.correctAnswer;

        console.log({
          type: (question as { type?: string }).type ?? practice.type,
          submittedAnswer,
          correctAnswer: question.correctAnswer,
        });

        if (practice.type === "image_choice") {
          return count + (String(submittedAnswer ?? "").trim() === String(correctAnswer ?? "").trim() ? 1 : 0);
        }

        return count + (normalizeAnswer(submittedAnswer) === normalizeAnswer(correctAnswer) ? 1 : 0);
      }, 0);

      evaluatedScore =
        evaluatedTotalCount > 0 ? Math.round(((evaluatedCorrectCount ?? 0) / evaluatedTotalCount) * 100) : 0;
    }
  }

  const roadmap = (practice.config as PracticeConfig | undefined)?.roadmap;
  if (payload.stageId && Array.isArray(roadmap) && !roadmap.some((stage) => stage.id === payload.stageId)) {
    throw new Error("Invalid stage payload");
  }

  const attemptsToday = await findPracticeAttemptsByUserToday(userId, practiceId);
  const dailyXpEarned = attemptsToday.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
  const dailyXpLimit = practice.maxDailyXp;
  const attemptsRemaining = practice.dailyAttemptLimit - attemptsToday.length;

  const stageXpReward = payload.stageId
    ? (roadmap?.find((stage) => stage.id === payload.stageId)?.xpReward ?? practice.xpReward)
    : practice.xpReward;
  const accuracy =
    (evaluatedTotalCount ?? 0) > 0 && (evaluatedCorrectCount ?? 0) > 0
      ? (evaluatedCorrectCount ?? 0) / (evaluatedTotalCount ?? 0)
      : 0;
  const rawXp = Math.round(stageXpReward * accuracy);

  let xpEarned = 0;
  let xpCapped = false;

  if (attemptsRemaining <= 0 || dailyXpEarned >= dailyXpLimit) {
    xpCapped = true;
  } else {
    xpEarned = Math.min(rawXp, dailyXpLimit - dailyXpEarned);
  }

  const attempt = await createPracticeAttempt({
    userId,
    practiceId,
    levelId: practice.levelId,
    score: evaluatedScore ?? 0,
    correctCount: evaluatedCorrectCount ?? 0,
    totalCount: evaluatedTotalCount ?? 0,
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
    score: evaluatedScore ?? 0,
    correctCount: evaluatedCorrectCount ?? 0,
    totalCount: evaluatedTotalCount ?? 0,
    stageId: payload.stageId,
    xpEarned,
    dailyXpEarned: dailyXpEarned + xpEarned,
    dailyXpLimit,
    xpCapped,
    message: xpCapped ? "You've reached the daily XP limit for this practice" : "Practice attempt recorded",
  };
};
