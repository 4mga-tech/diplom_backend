import {
  createXpLedgerEntry,
  findUserById,
  findXpLedgerEntry,
  updateUserActivity,
} from "./progress.repository";
import { UserProgress } from "./user-progress.model";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const awardXpOnce = async ({
  userId,
  sourceType,
  sourceId,
  xp,
  progress,
}: {
  userId: string;
  sourceType: "lesson_complete" | "quiz_submit" | "review_submit";
  sourceId: string;
  xp: number;
  progress?: InstanceType<typeof UserProgress> | null;
}) => {
  if (xp <= 0) {
    return { xpGained: 0, totalXp: progress?.totalXp ?? 0 };
  }

  const existing = await findXpLedgerEntry(userId, sourceType, sourceId);
  if (existing) {
    return { xpGained: 0, totalXp: progress?.totalXp ?? 0 };
  }

  await createXpLedgerEntry({ userId, sourceType, sourceId, xp });

  if (progress) {
    progress.totalXp += xp;
    await progress.save();
  }

  const user = await findUserById(userId);
  if (user) {
    user.totalXP += xp;
    await user.save();
  }

  return { xpGained: xp, totalXp: progress?.totalXp ?? user?.totalXP ?? xp };
};

export const syncUserStreak = async ({
  userId,
  progresses,
  activityDate = new Date(),
}: {
  userId: string;
  progresses: Array<InstanceType<typeof UserProgress>>;
  activityDate?: Date;
}) => {
  const user = await findUserById(userId);
  if (!user) {
    return { streak: 0 };
  }

  const today = startOfDay(activityDate);
  const lastActive = user.lastActiveAt ? startOfDay(new Date(user.lastActiveAt)) : null;

  if (!lastActive) {
    user.streak = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    return { streak: user.streak };
  } else if (addDays(lastActive, 1).getTime() === today.getTime()) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastActiveAt = today;
  await user.save();

  await Promise.all(
    progresses.map(async (progress) => {
      progress.streak = user.streak;
      await progress.save();
    }),
  );

  return { streak: user.streak };
};

