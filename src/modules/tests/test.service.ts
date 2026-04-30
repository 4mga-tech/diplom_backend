import { applyXpChangeOnce } from "../progress/xp.service";
import { findUserById } from "../progress/progress.repository";
import { LevelTest } from "./test.model";

type TestType = "vocabulary" | "grammar";
type DisplayTestType = TestType | "listening" | "speaking";

type TestAnswerPayload = {
  questionId: string;
  selectedOptionId?: string | null;
  selected?: string | null;
};

const PASSING_SCORE_DEFAULT = 75;
const ACTIVE_TEST_TYPES: TestType[] = ["vocabulary", "grammar"];
const DISPLAY_TEST_TYPES: Array<{
  testType: DisplayTestType;
  title: string;
  active: boolean;
}> = [
  { testType: "vocabulary", title: "Vocabulary Exam", active: true },
  { testType: "grammar", title: "Grammar Exam", active: true },
  { testType: "listening", title: "Listening", active: false },
  { testType: "speaking", title: "Speaking", active: false },
];
const VALID_LEVEL_IDS = new Set(["m1", "m2", "m3", "m4"]);
const ACTIVE_TEST_TYPE_SET = new Set<TestType>(ACTIVE_TEST_TYPES);

const normalizeLevelId = (levelId: string) => {
  const normalized = levelId.trim().toLowerCase();

  if (!VALID_LEVEL_IDS.has(normalized)) {
    throw new Error("Unsupported levelId");
  }

  return normalized;
};

const normalizeTestType = (testType: string): TestType => {
  const normalized = testType.trim().toLowerCase();

  if (!ACTIVE_TEST_TYPES.includes(normalized as TestType)) {
    throw new Error("Unsupported testType");
  }

  return normalized as TestType;
};

const getTestOrThrow = async (levelId: string, testType: TestType) => {
  const levelTest = await LevelTest.findOne({ levelId, testType }).lean();

  if (!levelTest) {
    throw new Error("Level test not found");
  }

  return levelTest;
};

export const listLevelTests = async () => {
  const levelTests = await LevelTest.find({}, { levelId: 1, testType: 1, questions: 1 })
    .sort({ levelId: 1, testType: 1 })
    .lean();

  const questionCountByLevel = new Map<string, Record<TestType, number>>();

  for (const test of levelTests) {
    const counts = questionCountByLevel.get(test.levelId) ?? {
      vocabulary: 0,
      grammar: 0,
    };
    counts[test.testType as TestType] = test.questions.length;
    questionCountByLevel.set(test.levelId, counts);
  }

  return ["m1", "m2", "m3", "m4"]
    .filter((levelId) => questionCountByLevel.has(levelId))
    .map((levelId) => {
      const counts = questionCountByLevel.get(levelId)!;

      return {
        levelId,
        title: levelId.toUpperCase(),
        activeTypes: ACTIVE_TEST_TYPES.filter((testType) => counts[testType] > 0),
        questionCounts: counts,
      };
    });
};

export const listLevelTestTypes = async (levelIdInput: string) => {
  const levelId = normalizeLevelId(levelIdInput);
  const levelTests = await LevelTest.find({ levelId }, { testType: 1, title: 1, questions: 1 })
    .sort({ testType: 1 })
    .lean();

  if (levelTests.length === 0) {
    throw new Error("Level tests not found");
  }

  const activeTestMap = new Map(
    levelTests.map((test) => [
      test.testType,
      {
        title: test.title,
        questionCount: test.questions.length,
      },
    ]),
  );

  return {
    levelId,
    types: DISPLAY_TEST_TYPES.map((item) => {
      const activeTest = ACTIVE_TEST_TYPE_SET.has(item.testType as TestType)
        ? activeTestMap.get(item.testType as TestType)
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

export const getLevelTestQuestions = async (levelIdInput: string, testTypeInput: string) => {
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

export const submitLevelTest = async (
  userId: string,
  levelIdInput: string,
  testTypeInput: string,
  answers: TestAnswerPayload[],
) => {
  const levelId = normalizeLevelId(levelIdInput);
  const testType = normalizeTestType(testTypeInput);
  const levelTest = await getTestOrThrow(levelId, testType);
  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId,
      (answer.selectedOptionId ?? answer.selected ?? "").toString().trim().toLowerCase(),
    ]),
  );

  const orderedQuestions = levelTest.questions
    .slice()
    .sort((left, right) => left.order - right.order);

  const results = orderedQuestions.map((question) => {
    const selectedOptionId = answerMap.get(question.id) ?? null;
    const correctOption = question.options.find((option) => option.id === question.correctOptionId) ?? null;
    const selectedOption =
      question.options.find((option) => option.id.toLowerCase() === selectedOptionId) ?? null;
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
    ? await applyXpChangeOnce({
        userId,
        sourceType: "level_test_reward",
        sourceId: `${levelId}:${testType}`,
        xp: levelTest.xpReward,
      })
    : { xpDelta: 0, totalXp: (await findUserById(userId))?.totalXP ?? 0 };

  if (!passed) {
    const user = await findUserById(userId);
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
