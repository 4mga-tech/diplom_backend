export type PracticeAttemptPayload = {
  score: number;
  correctCount: number;
  totalCount: number;
  stageId?: string;
};

export type PracticeRoadmapStage = {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  xpReward: number;
  isUnlocked: boolean;
  isCompleted?: boolean;
  questionIds: string[];
};

export type PracticeConfig = Record<string, unknown> & {
  roadmap?: PracticeRoadmapStage[];
};

export type PracticeQuestion = {
  id: string;
  prompt: string;
  subtitle?: string;
  options?: Array<
    | string
    | {
        id: string;
        label: string;
        imageUrl: string;
      }
  >;
  correctAnswer: string;
  result?: string;
  meaningEn?: string;
  parts?: string[];
  imageKey?: string;
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
  config: PracticeConfig;
  questions: PracticeQuestion[];
};
