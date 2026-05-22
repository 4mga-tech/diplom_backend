import { Practice } from "./practice.model";
import { PracticeAttempt } from "./practice-attempt.model";
import { PracticeSeedItem } from "./practice.types";

function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export const findPracticeById = async (practiceId: string) => {
  return Practice.findOne({ id: practiceId });
};

export const findAllActivePractice = async () => {
  return Practice.find({ isActive: true }).sort({ order: 1 });
};

export const upsertPractice = async (practiceData: PracticeSeedItem) => {
  return Practice.findOneAndUpdate({ id: practiceData.id }, practiceData, { upsert: true, new: true });
};

export const createPracticeAttempt = async (attempt: {
  userId: string;
  practiceId: string;
  levelId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  stageId?: string;
  xpEarned: number;
}) => {
  return PracticeAttempt.create(attempt);
};

export const findPracticeAttemptsByUserToday = async (userId: string, practiceId: string) => {
  const today = getStartOfToday();
  return PracticeAttempt.find({
    userId,
    practiceId,
    createdAt: { $gte: today },
  });
};

export const findPracticeAttemptsByUser = async (userId: string, practiceId: string) => {
  return PracticeAttempt.find({
    userId,
    practiceId,
  });
};
