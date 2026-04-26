import { UserProgress } from "./user-progress.model";
import {
  claimDailyLoginRewardWindow,
  createXpLedgerEntry,
  findUserById,
  findXpLedgerEntry,
  listXpLedgerEntries,
} from "./progress.repository";
import { XpSourceType } from "./progress.types";

const DAILY_LOGIN_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAILY_LOGIN_XP = 10;

const getDailyLoginEligibility = (lastDailyLoginXpAt: Date | null, now: Date) => {
  if (!lastDailyLoginXpAt) {
    return {
      isEligible: true,
      nextEligibleAt: now,
    };
  }

  const nextEligibleAt = new Date(lastDailyLoginXpAt.getTime() + DAILY_LOGIN_WINDOW_MS);

  return {
    isEligible: nextEligibleAt.getTime() <= now.getTime(),
    nextEligibleAt,
  };
};

export const applyXpChangeOnce = async ({
  userId,
  sourceType,
  sourceId,
  xp,
  progress,
}: {
  userId: string;
  sourceType: XpSourceType;
  sourceId: string;
  xp: number;
  progress?: InstanceType<typeof UserProgress> | null;
}) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (xp === 0) {
    return {
      xpDelta: 0,
      totalXp: user.totalXP,
    };
  }

  const existing = await findXpLedgerEntry(userId, sourceType, sourceId);
  if (existing) {
    return {
      xpDelta: 0,
      totalXp: user.totalXP,
    };
  }

  const nextTotalXp = user.totalXP + xp;
  if (nextTotalXp < 0) {
    throw new Error("Not enough XP");
  }

  await createXpLedgerEntry({ userId, sourceType, sourceId, xp });

  user.totalXP = nextTotalXp;
  await user.save();

  if (progress && xp > 0) {
    progress.totalXp += xp;
    await progress.save();
  }

  return {
    xpDelta: xp,
    totalXp: user.totalXP,
  };
};

export const getXpSummary = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const { isEligible, nextEligibleAt } = getDailyLoginEligibility(
    user.lastDailyLoginXpAt ? new Date(user.lastDailyLoginXpAt) : null,
    new Date(),
  );

  return {
    totalXp: user.totalXP,
    lastDailyLoginXpAt: user.lastDailyLoginXpAt,
    dailyLogin: {
      isEligible,
      rewardXp: DEFAULT_DAILY_LOGIN_XP,
      nextEligibleAt,
    },
  };
};

export const getXpHistory = async (userId: string, limit = 50) => {
  const entries = await listXpLedgerEntries(userId, limit);

  return {
    items: entries.map((entry) => ({
      id: String(entry._id),
      amount: entry.xp,
      source: entry.sourceType,
      sourceId: entry.sourceId,
      timestamp: entry.createdAt,
    })),
  };
};

export const claimDailyLoginXp = async (
  userId: string,
  rewardXp = DEFAULT_DAILY_LOGIN_XP,
) => {
  const now = new Date();
  const eligibleBefore = new Date(now.getTime() - DAILY_LOGIN_WINDOW_MS);
  const claimedUser = await claimDailyLoginRewardWindow(userId, now, eligibleBefore);

  if (!claimedUser) {
    const currentUser = await findUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const { nextEligibleAt } = getDailyLoginEligibility(
      currentUser.lastDailyLoginXpAt ? new Date(currentUser.lastDailyLoginXpAt) : null,
      now,
    );

    return {
      eligible: false,
      xpGained: 0,
      totalXp: currentUser.totalXP,
      lastClaimedAt: currentUser.lastDailyLoginXpAt,
      nextEligibleAt,
    };
  }

  const result = await applyXpChangeOnce({
    userId,
    sourceType: "daily_login",
    sourceId: `daily_login:${now.toISOString()}`,
    xp: rewardXp,
  });

  return {
    eligible: true,
    xpGained: result.xpDelta,
    totalXp: result.totalXp,
    lastClaimedAt: claimedUser.lastDailyLoginXpAt,
    nextEligibleAt: new Date(now.getTime() + DAILY_LOGIN_WINDOW_MS),
  };
};
