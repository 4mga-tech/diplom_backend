import { UserProgress } from "./user-progress.model";
import { QuizAttempt } from "./quiz-attempt.model";
import { XpLedger } from "./xp-ledger.model";
import { User } from "../user/user.model";
import { XpSourceType } from "./progress.types";

export const findUserProgress = (userId: string, courseId: string) =>
  UserProgress.findOne({ userId, courseId });

export const findOrCreateUserProgress = async (
  userId: string,
  courseId: string,
  unlockedLessonIds: string[] = [],
) => {
  return UserProgress.findOneAndUpdate(
    { userId, courseId },
    {
      $setOnInsert: {
        userId,
        courseId,
        completedLessonIds: [],
        unlockedLessonIds,
        totalXp: 0,
        streak: 0,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
    },
  );
};

export const saveUserProgress = (
  progress: InstanceType<typeof UserProgress>,
) => progress.save();

export const listUserProgress = (userId: string) =>
  UserProgress.find({ userId }).lean();

export const createQuizAttempt = (payload: {
  userId: string;
  quizId: string;
  lessonId: string;
  answers: unknown[];
  correctCount: number;
  score: number;
  passed: boolean;
  xpAwarded: number;
}) => QuizAttempt.create(payload);

export const findXpLedgerEntry = (
  userId: string,
  sourceType: string,
  sourceId: string,
) => XpLedger.findOne({ userId, sourceType, sourceId }).lean();

export const createXpLedgerEntry = (payload: {
  userId: string;
  sourceType: XpSourceType;
  sourceId: string;
  xp: number;
}) => XpLedger.create(payload);

export const listXpLedgerEntries = (userId: string, limit = 50) =>
  XpLedger.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();

export const findUserById = (userId: string) => User.findById(userId);

export const claimDailyLoginRewardWindow = (
  userId: string,
  claimedAt: Date,
  eligibleBefore: Date,
) =>
  User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { lastDailyLoginXpAt: null },
        { lastDailyLoginXpAt: { $lte: eligibleBefore } },
      ],
    },
    {
      $set: {
        lastDailyLoginXpAt: claimedAt,
      },
    },
    { returnDocument: "after" },
  );

export const updateUserActivity = (
  userId: string,
  payload: Partial<{ totalXP: number; streak: number; lastActiveAt: Date }>,
) => User.findByIdAndUpdate(userId, payload, { returnDocument: "after" });
