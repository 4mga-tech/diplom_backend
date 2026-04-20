"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const course_model_1 = require("../modules/learning/course.model");
const unit_model_1 = require("../modules/learning/unit.model");
const lesson_model_1 = require("../modules/learning/lesson.model");
const lesson_content_model_1 = require("../modules/learning/lesson-content.model");
const quiz_model_1 = require("../modules/learning/quiz.model");
const quiz_question_model_1 = require("../modules/learning/quiz-question.model");
const daily_review_model_1 = require("../modules/review/daily-review.model");
const user_progress_model_1 = require("../modules/progress/user-progress.model");
const quiz_attempt_model_1 = require("../modules/progress/quiz-attempt.model");
const xp_ledger_model_1 = require("../modules/progress/xp-ledger.model");
const b1_u1_l1_json_1 = __importDefault(require("../data/seed/b1_u1_l1.json"));
const b1_u1_l2_json_1 = __importDefault(require("../data/seed/b1_u1_l2.json"));
const b1_u1_l3_json_1 = __importDefault(require("../data/seed/b1_u1_l3.json"));
const b1_u2_l1_json_1 = __importDefault(require("../data/seed/b1_u2_l1.json"));
const b1_u2_l2_json_1 = __importDefault(require("../data/seed/b1_u2_l2.json"));
const b1_u2_l3_json_1 = __importDefault(require("../data/seed/b1_u2_l3.json"));
const b1_u3_l1_json_1 = __importDefault(require("../data/seed/b1_u3_l1.json"));
const b1_u3_l2_json_1 = __importDefault(require("../data/seed/b1_u3_l2.json"));
const b1_u3_l3_json_1 = __importDefault(require("../data/seed/b1_u3_l3.json"));
const level_model_1 = __importDefault(require("../modules/content/level.model"));
const levels_manifest_json_1 = __importDefault(require("../data/seed/levels_manifest.json"));
const b1LessonSeeds = [
    b1_u1_l1_json_1.default,
    b1_u1_l2_json_1.default,
    b1_u1_l3_json_1.default,
    b1_u2_l1_json_1.default,
    b1_u2_l2_json_1.default,
    b1_u2_l3_json_1.default,
    b1_u3_l1_json_1.default,
    b1_u3_l2_json_1.default,
    b1_u3_l3_json_1.default,
];
async function seed() {
    await (0, db_1.connectDB)(env_1.env.MONGODB_URI);
    console.log("Cleaning learning collections...");
    await Promise.all([
        course_model_1.Course.deleteMany({}),
        unit_model_1.Unit.deleteMany({}),
        lesson_model_1.LearningLesson.deleteMany({}),
        lesson_content_model_1.LessonContent.deleteMany({}),
        quiz_model_1.Quiz.deleteMany({}),
        quiz_question_model_1.QuizQuestion.deleteMany({}),
        daily_review_model_1.DailyReview.deleteMany({}),
        user_progress_model_1.UserProgress.deleteMany({}),
        quiz_attempt_model_1.QuizAttempt.deleteMany({}),
        xp_ledger_model_1.XpLedger.deleteMany({}),
        level_model_1.default.deleteMany({}),
    ]);
    console.log("Creating levels...");
    await level_model_1.default.insertMany(levels_manifest_json_1.default.map((level, index) => ({
        ...level,
        order: index + 1,
    })));
    console.log("Creating courses...");
    await course_model_1.Course.insertMany([
        {
            id: "b1",
            title: "B1 Cyrillic Foundations",
        },
    ]);
    console.log("Creating units...");
    await unit_model_1.Unit.insertMany([
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
    await lesson_model_1.LearningLesson.insertMany(b1LessonSeeds.map((item) => item.lesson));
    console.log("Creating lesson content...");
    await lesson_content_model_1.LessonContent.insertMany(b1LessonSeeds.flatMap((item) => item.contents));
    console.log("Creating quizzes...");
    await quiz_model_1.Quiz.insertMany(b1LessonSeeds.map((item) => item.quiz));
    await quiz_question_model_1.QuizQuestion.insertMany(b1LessonSeeds.flatMap((item) => item.quizQuestions));
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
