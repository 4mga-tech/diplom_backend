import { connectDB } from "../config/db";
import { env } from "../config/env";
import path from "node:path";
import { promises as fs } from "node:fs";

import { Course } from "../modules/learning/course.model";
import { Unit } from "../modules/learning/unit.model";
import { LearningLesson } from "../modules/learning/lesson.model";
import { LessonContent } from "../modules/learning/lesson-content.model";
import { Quiz } from "../modules/learning/quiz.model";
import { QuizQuestion } from "../modules/learning/quiz-question.model";

import { DailyReview } from "../modules/review/daily-review.model";
import { UserProgress } from "../modules/progress/user-progress.model";
import { QuizAttempt } from "../modules/progress/quiz-attempt.model";
import { XpLedger } from "../modules/progress/xp-ledger.model";
import Level from "../modules/content/level.model";
import Vocabulary from "../modules/content/vocabulary.model";
import {
  SUPPORTED_VOCABULARY_LEVEL_IDS,
  getVocabularyCountsByLevel,
  loadVocabularySeedRecords,
} from "../modules/content/vocabulary.seed";

type LevelSeed = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  order?: number;
  vocabularyReady?: boolean;
  vocabularyCount?: number;
  gradient?: string[];
};

type UnitSeed = {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  description?: string;
  order: number;
};

type LessonSeedBundle = {
  lesson: {
    id: string;
    unitId: string;
    title: string;
    subtitle: string;
    order: number;
    xpReward: number;
    quizXpReward: number;
  };
  contents: Array<{
    id: string;
    lessonId: string;
    type: string;
    title: string;
    order: number;
    content: unknown;
  }>;
  quiz?: {
    id: string;
    lessonId: string;
    title: string;
    passingScore: number;
  };
  quizQuestions?: Array<{
    id: string;
    quizId: string;
    type: string;
    prompt: string;
    helper?: string;
    options?: string[];
    correctAnswer: unknown;
    explanation?: string;
    xpReward: number;
    order: number;
  }>;
};

const LESSON_SEED_DIR = path.resolve(process.cwd(), "src", "data", "seed", "lessons");

const readJsonFile = async <T>(filePath: string) => {
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
};

const getLessonSeedFileNames = async () => {
  const entries = await fs.readdir(LESSON_SEED_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".json"))
    .filter((name) => !name.endsWith("_old.json"))
    .filter((name) => !name.endsWith("levels_manifest.json"))
    .filter((name) => !name.endsWith("units_manifest.json"))
    .sort((left, right) => left.localeCompare(right));
};

const validateLessonSeeds = (unitIds: Set<string>, lessonSeeds: LessonSeedBundle[]) => {
  const lessonIds = new Set(lessonSeeds.map((item) => item.lesson.id));

  for (const seed of lessonSeeds) {
    if (!unitIds.has(seed.lesson.unitId)) {
      throw new Error(`Lesson ${seed.lesson.id} references missing unitId ${seed.lesson.unitId}`);
    }

    const hasQuiz = Boolean(seed.quiz);
    const quizQuestions = seed.quizQuestions ?? [];

    if (hasQuiz && seed.quiz!.lessonId !== seed.lesson.id) {
      throw new Error(`Quiz ${seed.quiz!.id} lessonId does not match lesson ${seed.lesson.id}`);
    }

    if (!hasQuiz && quizQuestions.length > 0) {
      throw new Error(`Lesson ${seed.lesson.id} has quiz questions without a quiz`);
    }

    for (const content of seed.contents) {
      if (content.lessonId !== seed.lesson.id) {
        throw new Error(`Content ${content.id} has mismatched lessonId ${content.lessonId}`);
      }

      if (content.type === "quiz_link" && !hasQuiz) {
        throw new Error(`Lesson ${seed.lesson.id} has a quiz link but no quiz`);
      }

      if (
        hasQuiz &&
        content.type === "quiz_link" &&
        (content.content as { quizId?: string })?.quizId !== seed.quiz!.id
      ) {
        throw new Error(`Quiz link content ${content.id} does not reference quiz ${seed.quiz!.id}`);
      }
    }

    for (const question of quizQuestions) {
      if (!hasQuiz || question.quizId !== seed.quiz!.id) {
        throw new Error(`Question ${question.id} has mismatched quizId ${question.quizId}`);
      }
    }
  }

  if (lessonIds.size !== lessonSeeds.length) {
    throw new Error("Duplicate lesson ids found in lesson seed files");
  }
};

const loadSeedData = async () => {
  const [levelsManifest, unitsManifest, lessonSeedFileNames] = await Promise.all([
    readJsonFile<LevelSeed[]>(path.join(LESSON_SEED_DIR, "levels_manifest.json")),
    readJsonFile<UnitSeed[]>(path.join(LESSON_SEED_DIR, "units_manifest.json")),
    getLessonSeedFileNames(),
  ]);

  const lessonSeeds = await Promise.all(
    lessonSeedFileNames.map((fileName) =>
      readJsonFile<LessonSeedBundle>(path.join(LESSON_SEED_DIR, fileName)),
    ),
  );

  validateLessonSeeds(new Set(unitsManifest.map((unit) => unit.id)), lessonSeeds);

  return {
    levelsManifest,
    unitsManifest,
    lessonSeeds,
  };
};

async function seed() {
  await connectDB(env.MONGODB_URI);
  const { levelsManifest, unitsManifest, lessonSeeds } = await loadSeedData();
  const vocabularySeedRecords = loadVocabularySeedRecords();
  const vocabularyCountsByLevel = getVocabularyCountsByLevel(vocabularySeedRecords);

  console.log("Cleaning learning collections...");
  await Promise.all([
    Course.deleteMany({}),
    Unit.deleteMany({}),
    LearningLesson.deleteMany({}),
    LessonContent.deleteMany({}),
    Quiz.deleteMany({}),
    QuizQuestion.deleteMany({}),
    DailyReview.deleteMany({}),
    UserProgress.deleteMany({}),
    QuizAttempt.deleteMany({}),
    XpLedger.deleteMany({}),
    Level.deleteMany({}),
    Vocabulary.deleteMany({}),
  ]);

  console.log("Creating levels...");
  await Level.insertMany(
    levelsManifest.map((level, index) => {
      const normalizedLevelId = level.id.toLowerCase();
      const isVocabularyLevel = SUPPORTED_VOCABULARY_LEVEL_IDS.includes(
        normalizedLevelId as (typeof SUPPORTED_VOCABULARY_LEVEL_IDS)[number],
      );
      const vocabularyCount = isVocabularyLevel
        ? vocabularyCountsByLevel[
            normalizedLevelId as (typeof SUPPORTED_VOCABULARY_LEVEL_IDS)[number]
          ]
        : 0;

      return {
        ...level,
        order: level.order ?? index + 1,
        vocabularyReady: isVocabularyLevel ? vocabularyCount > 0 : false,
        vocabularyCount,
      };
    }),
  );

  console.log("Creating courses...");
  await Course.insertMany(
    levelsManifest.map((level) => ({
      id: level.id,
      title: level.title,
    })),
  );

  console.log("Creating units...");
  await Unit.insertMany(unitsManifest);

  console.log("Creating lessons...");
  await LearningLesson.insertMany(lessonSeeds.map((item) => item.lesson));

  console.log("Creating lesson content...");
  await LessonContent.insertMany(lessonSeeds.flatMap((item) => item.contents));
  console.log("Creating quizzes...");
  await Quiz.insertMany(lessonSeeds.flatMap((item) => (item.quiz ? [item.quiz] : [])));

  await QuizQuestion.insertMany(lessonSeeds.flatMap((item) => item.quizQuestions ?? []));

  console.log("Creating vocabulary...");
  await Vocabulary.insertMany(vocabularySeedRecords);

  // console.log("Creating daily review...");
  // await DailyReview.create({
  //   reviewId: "daily_review_2026_04_16",
  //   dateKey: "2026-04-16",
  //   title: "Today's Cyrillic Review",
  //   questions: [
  //     {
  //       id: "review_q1",
  //       type: "multiple_choice",
  //       prompt: "Which one is the letter А?",
  //       helper: "Choose the correct letter.",
  //       options: ["А", "Ө", "Ю", "Е"],
  //       correctAnswer: "А",
  //       explanation: "А is the Cyrillic letter A.",
  //       xpReward: 5,
  //       order: 1,
  //     },
  //     {
  //       id: "review_q2",
  //       type: "multiple_choice",
  //       prompt: "Which word starts with Э?",
  //       helper: "Choose the correct word.",
  //       options: ["эмээ", "аав", "ус", "юу"],
  //       correctAnswer: "эмээ",
  //       explanation: "эмээ starts with Э.",
  //       xpReward: 5,
  //       order: 2,
  //     },
  //     {
  //       id: "review_q3",
  //       type: "multiple_choice",
  //       prompt: "Which letter matches the sound ü?",
  //       helper: "Choose the correct letter.",
  //       options: ["Ү", "У", "О", "Ы"],
  //       correctAnswer: "Ү",
  //       explanation: "Ү matches the ü sound.",
  //       xpReward: 5,
  //       order: 3,
  //     },
  //     {
  //       id: "review_q4",
  //       type: "multiple_choice",
  //       prompt: "Which one is the letter Я?",
  //       helper: "Choose the correct letter.",
  //       options: ["Ю", "Е", "Я", "Ё"],
  //       correctAnswer: "Я",
  //       explanation: "Я is the letter with the ya sound.",
  //       xpReward: 5,
  //       order: 4,
  //     },
  //     {
  //       id: "review_q5",
  //       type: "multiple_choice",
  //       prompt: "Which word means father?",
  //       helper: "Choose the correct word.",
  //       options: ["аав", "эмээ", "ор", "юу"],
  //       correctAnswer: "аав",
  //       explanation: "аав means father.",
  //       xpReward: 5,
  //       order: 5,
  //     },
  //     {
  //       id: "review_q6",
  //       type: "multiple_choice",
  //       prompt: "Which letter can sound like 'ye'?",
  //       helper: "Choose the correct letter.",
  //       options: ["Е", "И", "А", "Ө"],
  //       correctAnswer: "Е",
  //       explanation: "Е can sound like ye in some positions.",
  //       xpReward: 5,
  //       order: 6,
  //     },
  //   ],
  // });

  console.log("Seed success");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
