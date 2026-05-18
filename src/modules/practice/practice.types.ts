export type PracticeAttemptPayload = {
  score: number;
  correctCount: number;
  totalCount: number;
};

export type PracticeQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

export type PracticeSeedItem = {
  id: string;
  type: string;
  levelId: string;
  title: string;
  subtitle: string;
  description: string;
  xpReward: number;
  maxDailyXp: number;
  dailyAttemptLimit: number;
  isActive: boolean;
  order: number;
  config: Record<string, unknown>;
  questions: PracticeQuestion[];
};
