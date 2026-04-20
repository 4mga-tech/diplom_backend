import { connectDB } from "../config/db";
import { env } from "../config/env";

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
import b1u1l1 from "../data/seed/b1_u1_l1.json";
import b1u1l2 from "../data/seed/b1_u1_l2.json";
import b1u1l3 from "../data/seed/b1_u1_l3.json";
import b1u2l1 from "../data/seed/b1_u2_l1.json";
import b1u2l2 from "../data/seed/b1_u2_l2.json";
import b1u2l3 from "../data/seed/b1_u2_l3.json";
import b1u3l1 from "../data/seed/b1_u3_l1.json";
import b1u3l2 from "../data/seed/b1_u3_l2.json";
import b1u3l3 from "../data/seed/b1_u3_l3.json";
import Level from "../modules/content/level.model";
import levelsManifest from "../data/seed/levels_manifest.json";

const b1LessonSeeds: any[] = [
  b1u1l1,
  b1u1l2,
  b1u1l3,
  b1u2l1,
  b1u2l2,
  b1u2l3,
  b1u3l1,
  b1u3l2,
  b1u3l3,
];

async function seed() {
  await connectDB(env.MONGODB_URI);

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
  ]);

  console.log("Creating levels...");
  await Level.insertMany(
    levelsManifest.map((level: any, index: number) => ({
      ...level,
      order: index + 1,
    })),
  );

  console.log("Creating courses...");
  await Course.insertMany([
    {
      id: "b1",
      title: "B1 Cyrillic Foundations",
    },
  ]);

  console.log("Creating units...");
  await Unit.insertMany([
    {
      id: "b1-u1",
      courseId: "b1",
      title: "Unit 1: Cyrillic Basics",
      subtitle: "Intro, tracing, and alphabet groups",
      description: "Learn what Mongolian Cyrillic is, practice early handwriting, and understand the main letter categories.",
      order: 1,
    },
    {
      id: "b1-u2",
      courseId: "b1",
      title: "Unit 2: Letter Groups",
      subtitle: "Supporting vowels, consonants, and special letters",
      description: "Study supporting vowel letters, common consonants, and special sign letters used in the Mongolian Cyrillic alphabet.",
      order: 2,
    },
    {
      id: "b1-u3",
      courseId: "b1",
      title: "Unit 3: Reading and Writing Practice",
      subtitle: "Syllables, writing drills, and word building",
      description: "Practice reading syllables, completing letter patterns, and decoding simple words with the Cyrillic alphabet.",
      order: 3,
    },
  ]);

  console.log("Creating lessons...");
  await LearningLesson.insertMany(b1LessonSeeds.map((item) => item.lesson));

  console.log("Creating lesson content...");
  await LessonContent.insertMany(b1LessonSeeds.flatMap((item) => item.contents));
  console.log("Creating quizzes...");
  await Quiz.insertMany(b1LessonSeeds.map((item) => item.quiz));

  await QuizQuestion.insertMany(b1LessonSeeds.flatMap((item) => item.quizQuestions));

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
