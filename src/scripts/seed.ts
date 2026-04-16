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

import Level from "../modules/content/level.model";
import levelsManifest from "../data/seed/levels_manifest.json";

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
      order: 1,
    },
  ]);

  console.log("Creating lessons...");
  await LearningLesson.insertMany([
    {
      id: "b1-u1-l1",
      unitId: "b1-u1",
      title: "Cyrillic Letters 1",
      subtitle: "Learn the letters А, Э, and И",
      order: 1,
      xpReward: 20,
      quizXpReward: 10,
    },
    {
      id: "b1-u1-l2",
      unitId: "b1-u1",
      title: "Cyrillic Letters 2",
      subtitle: "Learn the letters О, Ө, У, and Ү",
      order: 2,
      xpReward: 25,
      quizXpReward: 10,
    },
    {
      id: "b1-u1-l3",
      unitId: "b1-u1",
      title: "Cyrillic Letters 3",
      subtitle: "Learn the letters Й, Ы, and Е",
      order: 3,
      xpReward: 30,
      quizXpReward: 10,
    },
    {
      id: "b1-u1-l4",
      unitId: "b1-u1",
      title: "Cyrillic Letters 4",
      subtitle: "Learn the letters Ё, Ю, and Я",
      order: 4,
      xpReward: 35,
      quizXpReward: 10,
    },
  ]);

  console.log("Creating lesson content...");
  await LessonContent.insertMany([
    {
      id: "b1-u1-l1-c1",
      lessonId: "b1-u1-l1",
      type: "text",
      title: "Introduction",
      order: 1,
      content: {
        text: "In this lesson, you will learn the Cyrillic letters А, Э, and И. Listen carefully, repeat the sounds, and read the example words aloud.",
      },
    },
    {
      id: "b1-u1-l1-c2",
      lessonId: "b1-u1-l1",
      type: "pronunciation",
      title: "Letter А",
      order: 2,
      content: {
        letter: "А а",
        transliteration: "a",
        pronunciationTip:
          "Open your mouth slightly and make a short clear 'a' sound.",
        exampleWord: "аав",
        exampleMeaning: "father",
        audioUrl: "https://example.com/audio/b1/a.mp3",
      },
    },
    {
      id: "b1-u1-l1-c3",
      lessonId: "b1-u1-l1",
      type: "pronunciation",
      title: "Letter Э",
      order: 3,
      content: {
        letter: "Э э",
        transliteration: "e",
        pronunciationTip: "Say a short and clear 'e' sound.",
        exampleWord: "эмээ",
        exampleMeaning: "grandmother",
        audioUrl: "https://example.com/audio/b1/e.mp3",
      },
    },
    {
      id: "b1-u1-l1-c4",
      lessonId: "b1-u1-l1",
      type: "pronunciation",
      title: "Letter И",
      order: 4,
      content: {
        letter: "И и",
        transliteration: "i",
        pronunciationTip: "Stretch your lips slightly and say 'i'.",
        exampleWord: "иш",
        exampleMeaning: "stem",
        audioUrl: "https://example.com/audio/b1/i.mp3",
      },
    },
    {
      id: "b1-u1-l1-c5",
      lessonId: "b1-u1-l1",
      type: "quiz",
      title: "Lesson Quiz",
      order: 5,
      content: {
        quizId: "quiz_b1_u1_l1",
      },
    },

    {
      id: "b1-u1-l2-c1",
      lessonId: "b1-u1-l2",
      type: "text",
      title: "Introduction",
      order: 1,
      content: {
        text: "This lesson introduces the letters О, Ө, У, and Ү. Focus on hearing the difference between the rounded vowel sounds.",
      },
    },
    {
      id: "b1-u1-l2-c2",
      lessonId: "b1-u1-l2",
      type: "pronunciation",
      title: "Letter О",
      order: 2,
      content: {
        letter: "О о",
        transliteration: "o",
        pronunciationTip: "Round your lips and say a short 'o'.",
        exampleWord: "ор",
        exampleMeaning: "bed",
        audioUrl: "https://example.com/audio/b1/o.mp3",
      },
    },
    {
      id: "b1-u1-l2-c3",
      lessonId: "b1-u1-l2",
      type: "pronunciation",
      title: "Letter Ө",
      order: 3,
      content: {
        letter: "Ө ө",
        transliteration: "ö",
        pronunciationTip: "Round the lips more softly than 'o'.",
        exampleWord: "өвөө",
        exampleMeaning: "grandfather",
        audioUrl: "https://example.com/audio/b1/oe.mp3",
      },
    },
    {
      id: "b1-u1-l2-c4",
      lessonId: "b1-u1-l2",
      type: "pronunciation",
      title: "Letter У",
      order: 4,
      content: {
        letter: "У у",
        transliteration: "u",
        pronunciationTip: "Push the lips forward and say a short 'u'.",
        exampleWord: "ус",
        exampleMeaning: "water",
        audioUrl: "https://example.com/audio/b1/u.mp3",
      },
    },
    {
      id: "b1-u1-l2-c5",
      lessonId: "b1-u1-l2",
      type: "pronunciation",
      title: "Letter Ү",
      order: 5,
      content: {
        letter: "Ү ү",
        transliteration: "ü",
        pronunciationTip: "Keep the lips rounded but the sound lighter.",
        exampleWord: "үүр",
        exampleMeaning: "nest",
        audioUrl: "https://example.com/audio/b1/ue.mp3",
      },
    },
    {
      id: "b1-u1-l2-c6",
      lessonId: "b1-u1-l2",
      type: "quiz",
      title: "Lesson Quiz",
      order: 6,
      content: {
        quizId: "quiz_b1_u1_l2",
      },
    },

    {
      id: "b1-u1-l3-c1",
      lessonId: "b1-u1-l3",
      type: "text",
      title: "Introduction",
      order: 1,
      content: {
        text: "This lesson teaches the letters Й, Ы, and Е. Practice reading the example words slowly.",
      },
    },
    {
      id: "b1-u1-l3-c2",
      lessonId: "b1-u1-l3",
      type: "pronunciation",
      title: "Letter Й",
      order: 2,
      content: {
        letter: "Й й",
        transliteration: "y",
        pronunciationTip: "Make a short glide sound like the y in yes.",
        exampleWord: "май",
        exampleMeaning: "May",
        audioUrl: "https://example.com/audio/b1/y.mp3",
      },
    },
    {
      id: "b1-u1-l3-c3",
      lessonId: "b1-u1-l3",
      type: "pronunciation",
      title: "Letter Ы",
      order: 3,
      content: {
        letter: "Ы ы",
        transliteration: "ii",
        pronunciationTip: "Keep the tongue back and say a deep central vowel.",
        exampleWord: "ын",
        exampleMeaning: "genitive particle",
        audioUrl: "https://example.com/audio/b1/ii.mp3",
      },
    },
    {
      id: "b1-u1-l3-c4",
      lessonId: "b1-u1-l3",
      type: "pronunciation",
      title: "Letter Е",
      order: 4,
      content: {
        letter: "Е е",
        transliteration: "ye/e",
        pronunciationTip: "At the start of a word it often sounds like 'ye'.",
        exampleWord: "ес",
        exampleMeaning: "nine",
        audioUrl: "https://example.com/audio/b1/ye.mp3",
      },
    },
    {
      id: "b1-u1-l3-c5",
      lessonId: "b1-u1-l3",
      type: "quiz",
      title: "Lesson Quiz",
      order: 5,
      content: {
        quizId: "quiz_b1_u1_l3",
      },
    },

    {
      id: "b1-u1-l4-c1",
      lessonId: "b1-u1-l4",
      type: "text",
      title: "Introduction",
      order: 1,
      content: {
        text: "This lesson teaches the letters Ё, Ю, and Я. Listen and compare how the sound begins with a y-like glide.",
      },
    },
    {
      id: "b1-u1-l4-c2",
      lessonId: "b1-u1-l4",
      type: "pronunciation",
      title: "Letter Ё",
      order: 2,
      content: {
        letter: "Ё ё",
        transliteration: "yo",
        pronunciationTip: "Start with a light y sound, then say 'o'.",
        exampleWord: "ёлка",
        exampleMeaning: "fir tree",
        audioUrl: "https://example.com/audio/b1/yo.mp3",
      },
    },
    {
      id: "b1-u1-l4-c3",
      lessonId: "b1-u1-l4",
      type: "pronunciation",
      title: "Letter Ю",
      order: 3,
      content: {
        letter: "Ю ю",
        transliteration: "yu",
        pronunciationTip: "Start with a light y sound, then say 'u'.",
        exampleWord: "юу",
        exampleMeaning: "what",
        audioUrl: "https://example.com/audio/b1/yu.mp3",
      },
    },
    {
      id: "b1-u1-l4-c4",
      lessonId: "b1-u1-l4",
      type: "pronunciation",
      title: "Letter Я",
      order: 4,
      content: {
        letter: "Я я",
        transliteration: "ya",
        pronunciationTip: "Start with a light y sound, then say 'a'.",
        exampleWord: "ямаа",
        exampleMeaning: "goat",
        audioUrl: "https://example.com/audio/b1/ya.mp3",
      },
    },
    {
      id: "b1-u1-l4-c5",
      lessonId: "b1-u1-l4",
      type: "quiz",
      title: "Lesson Quiz",
      order: 5,
      content: {
        quizId: "quiz_b1_u1_l4",
      },
    },
  ]);

  console.log("Creating quizzes...");
  await Quiz.insertMany([
    {
      id: "quiz_b1_u1_l1",
      lessonId: "b1-u1-l1",
      title: "Cyrillic Letters 1 Quiz",
      passingScore: 70,
    },
    {
      id: "quiz_b1_u1_l2",
      lessonId: "b1-u1-l2",
      title: "Cyrillic Letters 2 Quiz",
      passingScore: 70,
    },
    {
      id: "quiz_b1_u1_l3",
      lessonId: "b1-u1-l3",
      title: "Cyrillic Letters 3 Quiz",
      passingScore: 70,
    },
    {
      id: "quiz_b1_u1_l4",
      lessonId: "b1-u1-l4",
      title: "Cyrillic Letters 4 Quiz",
      passingScore: 70,
    },
  ]);

  await QuizQuestion.insertMany([
    {
      id: "quiz_b1_u1_l1_q1",
      quizId: "quiz_b1_u1_l1",
      type: "multiple_choice",
      prompt: "Which one is the letter А?",
      helper: "Choose the correct Cyrillic letter.",
      options: ["А", "Э", "И", "О"],
      correctAnswer: "А",
      explanation: "А is the Cyrillic letter A.",
      xpReward: 3,
      order: 1,
    },
    {
      id: "quiz_b1_u1_l1_q2",
      quizId: "quiz_b1_u1_l1",
      type: "multiple_choice",
      prompt: "Which word starts with А?",
      helper: "Pick the correct word.",
      options: ["аав", "эмээ", "иш", "ор"],
      correctAnswer: "аав",
      explanation: "The word аав starts with А.",
      xpReward: 3,
      order: 2,
    },
    {
      id: "quiz_b1_u1_l1_q3",
      quizId: "quiz_b1_u1_l1",
      type: "multiple_choice",
      prompt: "Which letter matches the sound 'i'?",
      helper: "Choose the correct letter.",
      options: ["Э", "И", "Я", "У"],
      correctAnswer: "И",
      explanation: "И usually matches the i sound.",
      xpReward: 4,
      order: 3,
    },

    {
      id: "quiz_b1_u1_l2_q1",
      quizId: "quiz_b1_u1_l2",
      type: "multiple_choice",
      prompt: "Which one is the letter Ө?",
      helper: "Choose the correct Cyrillic letter.",
      options: ["О", "Ө", "У", "Ү"],
      correctAnswer: "Ө",
      explanation: "Ө is the rounded front vowel.",
      xpReward: 3,
      order: 1,
    },
    {
      id: "quiz_b1_u1_l2_q2",
      quizId: "quiz_b1_u1_l2",
      type: "multiple_choice",
      prompt: "Which word means water?",
      helper: "Choose the correct word.",
      options: ["ус", "ор", "үүр", "өвөө"],
      correctAnswer: "ус",
      explanation: "ус means water.",
      xpReward: 3,
      order: 2,
    },
    {
      id: "quiz_b1_u1_l2_q3",
      quizId: "quiz_b1_u1_l2",
      type: "multiple_choice",
      prompt: "Which letter matches the sound ü?",
      helper: "Choose the correct letter.",
      options: ["Э", "И", "Ү", "Ы"],
      correctAnswer: "Ү",
      explanation: "Ү is commonly transliterated as ü.",
      xpReward: 4,
      order: 3,
    },

    {
      id: "quiz_b1_u1_l3_q1",
      quizId: "quiz_b1_u1_l3",
      type: "multiple_choice",
      prompt: "Which one is the letter Й?",
      helper: "Choose the correct letter.",
      options: ["Й", "Е", "Ё", "Я"],
      correctAnswer: "Й",
      explanation: "Й usually gives a short y glide sound.",
      xpReward: 3,
      order: 1,
    },
    {
      id: "quiz_b1_u1_l3_q2",
      quizId: "quiz_b1_u1_l3",
      type: "multiple_choice",
      prompt: "Which letter can sound like 'ye' at the beginning of a word?",
      helper: "Choose the correct letter.",
      options: ["Е", "Ы", "И", "У"],
      correctAnswer: "Е",
      explanation: "Е often sounds like ye at the beginning of a word.",
      xpReward: 3,
      order: 2,
    },
    {
      id: "quiz_b1_u1_l3_q3",
      quizId: "quiz_b1_u1_l3",
      type: "multiple_choice",
      prompt: "Which word contains Е?",
      helper: "Choose the correct word.",
      options: ["ес", "ус", "аав", "ор"],
      correctAnswer: "ес",
      explanation: "ес contains the letter Е.",
      xpReward: 4,
      order: 3,
    },

    {
      id: "quiz_b1_u1_l4_q1",
      quizId: "quiz_b1_u1_l4",
      type: "multiple_choice",
      prompt: "Which one is the letter Ю?",
      helper: "Choose the correct letter.",
      options: ["Ё", "Ю", "Я", "Е"],
      correctAnswer: "Ю",
      explanation: "Ю is the letter with the yu sound.",
      xpReward: 3,
      order: 1,
    },
    {
      id: "quiz_b1_u1_l4_q2",
      quizId: "quiz_b1_u1_l4",
      type: "multiple_choice",
      prompt: "Which word means what?",
      helper: "Choose the correct word.",
      options: ["ямаа", "юу", "ёс", "иш"],
      correctAnswer: "юу",
      explanation: "юу means what.",
      xpReward: 3,
      order: 2,
    },
    {
      id: "quiz_b1_u1_l4_q3",
      quizId: "quiz_b1_u1_l4",
      type: "multiple_choice",
      prompt: "Which letter matches the sound ya?",
      helper: "Choose the correct letter.",
      options: ["Ё", "Я", "Е", "Й"],
      correctAnswer: "Я",
      explanation: "Я is commonly transliterated as ya.",
      xpReward: 4,
      order: 3,
    },
  ]);

  console.log("Creating daily review...");
  await DailyReview.create({
    reviewId: "daily_review_2026_04_16",
    dateKey: "2026-04-16",
    title: "Today's Cyrillic Review",
    questions: [
      {
        id: "review_q1",
        type: "multiple_choice",
        prompt: "Which one is the letter А?",
        helper: "Choose the correct letter.",
        options: ["А", "Ө", "Ю", "Е"],
        correctAnswer: "А",
        explanation: "А is the Cyrillic letter A.",
        xpReward: 5,
        order: 1,
      },
      {
        id: "review_q2",
        type: "multiple_choice",
        prompt: "Which word starts with Э?",
        helper: "Choose the correct word.",
        options: ["эмээ", "аав", "ус", "юу"],
        correctAnswer: "эмээ",
        explanation: "эмээ starts with Э.",
        xpReward: 5,
        order: 2,
      },
      {
        id: "review_q3",
        type: "multiple_choice",
        prompt: "Which letter matches the sound ü?",
        helper: "Choose the correct letter.",
        options: ["Ү", "У", "О", "Ы"],
        correctAnswer: "Ү",
        explanation: "Ү matches the ü sound.",
        xpReward: 5,
        order: 3,
      },
      {
        id: "review_q4",
        type: "multiple_choice",
        prompt: "Which one is the letter Я?",
        helper: "Choose the correct letter.",
        options: ["Ю", "Е", "Я", "Ё"],
        correctAnswer: "Я",
        explanation: "Я is the letter with the ya sound.",
        xpReward: 5,
        order: 4,
      },
      {
        id: "review_q5",
        type: "multiple_choice",
        prompt: "Which word means father?",
        helper: "Choose the correct word.",
        options: ["аав", "эмээ", "ор", "юу"],
        correctAnswer: "аав",
        explanation: "аав means father.",
        xpReward: 5,
        order: 5,
      },
      {
        id: "review_q6",
        type: "multiple_choice",
        prompt: "Which letter can sound like 'ye'?",
        helper: "Choose the correct letter.",
        options: ["Е", "И", "А", "Ө"],
        correctAnswer: "Е",
        explanation: "Е can sound like ye in some positions.",
        xpReward: 5,
        order: 6,
      },
    ],
  });

  console.log("Seed success");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});