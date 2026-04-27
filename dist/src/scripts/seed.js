"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
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
const level_model_1 = __importDefault(require("../modules/content/level.model"));
const vocabulary_model_1 = __importDefault(require("../modules/content/vocabulary.model"));
const vocabulary_seed_1 = require("../modules/content/vocabulary.seed");
const LESSON_SEED_DIR = node_path_1.default.resolve(process.cwd(), "src", "data", "seed", "lessons");
const readJsonFile = async (filePath) => {
    const fileContents = await node_fs_1.promises.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
};
const getLessonSeedFileNames = async () => {
    const entries = await node_fs_1.promises.readdir(LESSON_SEED_DIR, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => name.endsWith(".json"))
        .filter((name) => !name.endsWith("_old.json"))
        .filter((name) => !name.endsWith("levels_manifest.json"))
        .filter((name) => !name.endsWith("units_manifest.json"))
        .sort((left, right) => left.localeCompare(right));
};
const validateLessonSeeds = (unitIds, lessonSeeds) => {
    const lessonIds = new Set(lessonSeeds.map((item) => item.lesson.id));
    for (const seed of lessonSeeds) {
        if (!unitIds.has(seed.lesson.unitId)) {
            throw new Error(`Lesson ${seed.lesson.id} references missing unitId ${seed.lesson.unitId}`);
        }
        const hasQuiz = Boolean(seed.quiz);
        const quizQuestions = seed.quizQuestions ?? [];
        if (hasQuiz && seed.quiz.lessonId !== seed.lesson.id) {
            throw new Error(`Quiz ${seed.quiz.id} lessonId does not match lesson ${seed.lesson.id}`);
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
            if (hasQuiz &&
                content.type === "quiz_link" &&
                content.content?.quizId !== seed.quiz.id) {
                throw new Error(`Quiz link content ${content.id} does not reference quiz ${seed.quiz.id}`);
            }
        }
        for (const question of quizQuestions) {
            if (!hasQuiz || question.quizId !== seed.quiz.id) {
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
        readJsonFile(node_path_1.default.join(LESSON_SEED_DIR, "levels_manifest.json")),
        readJsonFile(node_path_1.default.join(LESSON_SEED_DIR, "units_manifest.json")),
        getLessonSeedFileNames(),
    ]);
    const lessonSeeds = await Promise.all(lessonSeedFileNames.map((fileName) => readJsonFile(node_path_1.default.join(LESSON_SEED_DIR, fileName))));
    validateLessonSeeds(new Set(unitsManifest.map((unit) => unit.id)), lessonSeeds);
    return {
        levelsManifest,
        unitsManifest,
        lessonSeeds,
    };
};
async function seed() {
    await (0, db_1.connectDB)(env_1.env.MONGODB_URI);
    const { levelsManifest, unitsManifest, lessonSeeds } = await loadSeedData();
    const vocabularySeedRecords = (0, vocabulary_seed_1.loadVocabularySeedRecords)();
    const vocabularyCountsByLevel = (0, vocabulary_seed_1.getVocabularyCountsByLevel)(vocabularySeedRecords);
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
        vocabulary_model_1.default.deleteMany({}),
    ]);
    console.log("Creating levels...");
    await level_model_1.default.insertMany(levelsManifest.map((level, index) => {
        const normalizedLevelId = level.id.toLowerCase();
        const isVocabularyLevel = vocabulary_seed_1.SUPPORTED_VOCABULARY_LEVEL_IDS.includes(normalizedLevelId);
        const vocabularyCount = isVocabularyLevel
            ? vocabularyCountsByLevel[normalizedLevelId]
            : 0;
        return {
            ...level,
            order: level.order ?? index + 1,
            vocabularyReady: isVocabularyLevel ? vocabularyCount > 0 : false,
            vocabularyCount,
        };
    }));
    console.log("Creating courses...");
    await course_model_1.Course.insertMany(levelsManifest.map((level) => ({
        id: level.id,
        title: level.title,
    })));
    console.log("Creating units...");
    await unit_model_1.Unit.insertMany(unitsManifest);
    console.log("Creating lessons...");
    await lesson_model_1.LearningLesson.insertMany(lessonSeeds.map((item) => item.lesson));
    console.log("Creating lesson content...");
    await lesson_content_model_1.LessonContent.insertMany(lessonSeeds.flatMap((item) => item.contents));
    console.log("Creating quizzes...");
    await quiz_model_1.Quiz.insertMany(lessonSeeds.flatMap((item) => (item.quiz ? [item.quiz] : [])));
    await quiz_question_model_1.QuizQuestion.insertMany(lessonSeeds.flatMap((item) => item.quizQuestions ?? []));
    console.log("Creating vocabulary...");
    await vocabulary_model_1.default.insertMany(vocabularySeedRecords);
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
