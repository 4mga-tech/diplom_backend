"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitLevelTest = exports.getLevelTestQuestions = exports.listLevelTestTypes = exports.listLevelTests = void 0;
const xp_service_1 = require("../progress/xp.service");
const progress_repository_1 = require("../progress/progress.repository");
const test_model_1 = require("./test.model");
const PASSING_SCORE_DEFAULT = 75;
const ACTIVE_TEST_TYPES = ["vocabulary", "grammar"];
const DISPLAY_TEST_TYPES = [
    { testType: "vocabulary", title: "Vocabulary Exam", active: true },
    { testType: "grammar", title: "Grammar Exam", active: true },
    { testType: "listening", title: "Listening", active: false },
    { testType: "speaking", title: "Speaking", active: false },
];
const VALID_LEVEL_IDS = new Set(["m1", "m2", "m3", "m4"]);
const ACTIVE_TEST_TYPE_SET = new Set(ACTIVE_TEST_TYPES);
const normalizeLevelId = (levelId) => {
    const normalized = levelId.trim().toLowerCase();
    if (!VALID_LEVEL_IDS.has(normalized)) {
        throw new Error("Unsupported levelId");
    }
    return normalized;
};
const normalizeTestType = (testType) => {
    const normalized = testType.trim().toLowerCase();
    if (!ACTIVE_TEST_TYPES.includes(normalized)) {
        throw new Error("Unsupported testType");
    }
    return normalized;
};
const getTestOrThrow = async (levelId, testType) => {
    const levelTest = await test_model_1.LevelTest.findOne({ levelId, testType }).lean();
    if (!levelTest) {
        throw new Error("Level test not found");
    }
    return levelTest;
};
const listLevelTests = async () => {
    const levelTests = await test_model_1.LevelTest.find({}, { levelId: 1, testType: 1, questions: 1 })
        .sort({ levelId: 1, testType: 1 })
        .lean();
    const questionCountByLevel = new Map();
    for (const test of levelTests) {
        const counts = questionCountByLevel.get(test.levelId) ?? {
            vocabulary: 0,
            grammar: 0,
        };
        counts[test.testType] = test.questions.length;
        questionCountByLevel.set(test.levelId, counts);
    }
    return ["m1", "m2", "m3", "m4"]
        .filter((levelId) => questionCountByLevel.has(levelId))
        .map((levelId) => {
        const counts = questionCountByLevel.get(levelId);
        return {
            levelId,
            title: levelId.toUpperCase(),
            activeTypes: ACTIVE_TEST_TYPES.filter((testType) => counts[testType] > 0),
            questionCounts: counts,
        };
    });
};
exports.listLevelTests = listLevelTests;
const listLevelTestTypes = async (levelIdInput) => {
    const levelId = normalizeLevelId(levelIdInput);
    const levelTests = await test_model_1.LevelTest.find({ levelId }, { testType: 1, title: 1, questions: 1 })
        .sort({ testType: 1 })
        .lean();
    if (levelTests.length === 0) {
        throw new Error("Level tests not found");
    }
    const activeTestMap = new Map(levelTests.map((test) => [
        test.testType,
        {
            title: test.title,
            questionCount: test.questions.length,
        },
    ]));
    return {
        levelId,
        types: DISPLAY_TEST_TYPES.map((item) => {
            const activeTest = ACTIVE_TEST_TYPE_SET.has(item.testType)
                ? activeTestMap.get(item.testType)
                : undefined;
            return {
                testType: item.testType,
                title: activeTest?.title ?? item.title,
                active: item.active && Boolean(activeTest),
                status: item.active && activeTest ? "available" : "coming_soon",
                questionCount: activeTest?.questionCount ?? 0,
            };
        }),
    };
};
exports.listLevelTestTypes = listLevelTestTypes;
const getLevelTestQuestions = async (levelIdInput, testTypeInput) => {
    const levelId = normalizeLevelId(levelIdInput);
    const testType = normalizeTestType(testTypeInput);
    const levelTest = await getTestOrThrow(levelId, testType);
    return {
        levelId: levelTest.levelId,
        testType: levelTest.testType,
        title: levelTest.title,
        passingScore: levelTest.passingScore || PASSING_SCORE_DEFAULT,
        totalQuestions: levelTest.questions.length,
        questions: levelTest.questions
            .slice()
            .sort((left, right) => left.order - right.order)
            .map((question) => ({
            id: question.id,
            levelId: question.levelId,
            testType: question.testType,
            prompt: question.prompt,
            options: question.options,
            order: question.order,
        })),
    };
};
exports.getLevelTestQuestions = getLevelTestQuestions;
const submitLevelTest = async (userId, levelIdInput, testTypeInput, answers) => {
    const levelId = normalizeLevelId(levelIdInput);
    const testType = normalizeTestType(testTypeInput);
    const levelTest = await getTestOrThrow(levelId, testType);
    const answerMap = new Map(answers.map((answer) => [
        answer.questionId,
        (answer.selectedOptionId ?? answer.selected ?? "").toString().trim().toLowerCase(),
    ]));
    const orderedQuestions = levelTest.questions
        .slice()
        .sort((left, right) => left.order - right.order);
    const results = orderedQuestions.map((question) => {
        const selectedOptionId = answerMap.get(question.id) ?? null;
        const correctOption = question.options.find((option) => option.id === question.correctOptionId) ?? null;
        const selectedOption = question.options.find((option) => option.id.toLowerCase() === selectedOptionId) ?? null;
        const correct = selectedOptionId === question.correctOptionId.toLowerCase();
        return {
            questionId: question.id,
            prompt: question.prompt,
            selectedOptionId,
            selectedOptionText: selectedOption?.text ?? null,
            correctOptionId: question.correctOptionId,
            correctOptionText: correctOption?.text ?? null,
            correct,
            explanation: question.explanation,
        };
    });
    const correctCount = results.filter((result) => result.correct).length;
    const totalQuestions = orderedQuestions.length;
    const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= (levelTest.passingScore || PASSING_SCORE_DEFAULT);
    const xpResult = passed
        ? await (0, xp_service_1.applyXpChangeOnce)({
            userId,
            sourceType: "level_test_reward",
            sourceId: `${levelId}:${testType}`,
            xp: levelTest.xpReward,
        })
        : { xpDelta: 0, totalXp: (await (0, progress_repository_1.findUserById)(userId))?.totalXP ?? 0 };
    if (!passed) {
        const user = await (0, progress_repository_1.findUserById)(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            levelId,
            testType,
            score,
            passed,
            correctCount,
            totalQuestions,
            xpGained: 0,
            totalXp: user.totalXP,
            explanations: results,
        };
    }
    return {
        levelId,
        testType,
        score,
        passed,
        correctCount,
        totalQuestions,
        xpGained: xpResult.xpDelta,
        totalXp: xpResult.totalXp,
        explanations: results,
    };
};
exports.submitLevelTest = submitLevelTest;
