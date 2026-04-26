import { findLessonById, findUnitById } from "../learning/learning.repository";
import { getQuizForSubmission } from "../lessons/lesson.service";
import { syncUserStreak } from "../progress/progress.helpers";
import {
  createQuizAttempt,
  findUserById,
  findUserProgress,
  listUserProgress,
} from "../progress/progress.repository";
import { AnswerPayload } from "../progress/progress.types";
import { getCourseProgress } from "../progress/progress.service";
import { applyXpChangeOnce } from "../progress/xp.service";

const QUIZ_HINT_XP_COST = 5;

const getHintSourceId = (quizId: string, questionId: string, attemptId: string) =>
  `${quizId}:${questionId}:${attemptId}`;

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const getHintOptionIndexesToHide = ({
  userId,
  quizId,
  questionId,
  attemptId,
  options,
  correctAnswer,
}: {
  userId: string;
  quizId: string;
  questionId: string;
  attemptId: string;
  options: string[];
  correctAnswer: unknown;
}) => {
  if (attemptId.trim().length === 0) {
    throw new Error("attemptId is required");
  }

  if (options.length !== 4) {
    throw new Error("Hint is only supported for 4-option multiple_choice questions");
  }

  const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
  const correctIndex = options.findIndex(
    (option) => normalizeAnswer(option) === normalizedCorrectAnswer,
  );

  if (correctIndex < 0) {
    throw new Error("Question is missing a valid correct answer option");
  }

  const wrongIndexes = options
    .map((_, index) => index)
    .filter((index) => index !== correctIndex);

  if (wrongIndexes.length < 3) {
    throw new Error("Question does not have enough incorrect options for a hint");
  }

  const seed = hashString(`${userId}:${quizId}:${questionId}:${attemptId}`);
  const skippedWrongIndex = seed % wrongIndexes.length;

  return wrongIndexes.filter((_, index) => index !== skippedWrongIndex);
};

const normalizeAnswer = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === null || value === undefined) {
    return null;
  }

  return String(value).trim().toLowerCase();
};

const resolveSelectedAnswer = (selected: unknown, options: string[] = []) => {
  if (
    typeof selected === "number" &&
    Number.isInteger(selected) &&
    selected >= 0 &&
    selected < options.length
  ) {
    return options[selected];
  }

  return selected;
};

const isAnswerCorrect = (
  selected: unknown,
  correctAnswer: unknown,
  options: string[] = [],
) => normalizeAnswer(resolveSelectedAnswer(selected, options)) === normalizeAnswer(correctAnswer);

export const submitQuiz = async (
  userId: string,
  quizId: string,
  answers: AnswerPayload[],
) => {
  const { quiz, questions } = await getQuizForSubmission(quizId);
  const lesson = await findLessonById(quiz.lessonId);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const unit = await findUnitById(lesson.unitId);
  if (!unit) {
    throw new Error("Unit not found");
  }

  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.selected]));
  const correctCount = questions.reduce((count, question) => {
    const selected = answerMap.get(question.id);
    return count + (isAnswerCorrect(selected, question.correctAnswer, question.options) ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= quiz.passingScore;

  const progressState = await getCourseProgress(userId, unit.courseId);
  const progress = progressState.document;
  const totalAvailableXp = questions.reduce((sum, question) => sum + question.xpReward, 0);

  const xpResult = passed
    ? await applyXpChangeOnce({
        userId,
        sourceType: "quiz_reward",
        sourceId: quizId,
        xp: Math.min(lesson.quizXpReward || totalAvailableXp, totalAvailableXp),
        progress,
      })
    : { xpDelta: 0, totalXp: progress.totalXp };

  await createQuizAttempt({
    userId,
    quizId,
    lessonId: lesson.id,
    answers,
    correctCount,
    score,
    passed,
    xpAwarded: xpResult.xpDelta,
  });

  const progressDocs = await Promise.all(
    (await listUserProgress(userId)).map(async (item) => {
      if (item.courseId === progress.courseId) {
        return progress;
      }

      return (await findUserProgress(userId, item.courseId))!;
    }),
  );
  const streakResult = await syncUserStreak({ userId, progresses: progressDocs });

  if (progress.streak !== streakResult.streak) {
    progress.streak = streakResult.streak;
    await progress.save();
  }

  return {
    quizId,
    score,
    passed,
    correctCount,
    totalQuestions,
    xpGained: xpResult.xpDelta,
    totalXp: progress.totalXp,
  };
};

export const spendXpForQuizHint = async ({
  userId,
  quizId,
  questionId,
  attemptId,
}: {
  userId: string;
  quizId: string;
  questionId: string;
  attemptId: string;
}) => {
  const { quiz, questions } = await getQuizForSubmission(quizId);
  const question = questions.find((item) => item.id === questionId);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.type !== "multiple_choice") {
    throw new Error("Hint is only supported for multiple_choice questions");
  }

  const optionIndexesToHide = getHintOptionIndexesToHide({
    userId,
    quizId,
    questionId,
    attemptId,
    options: question.options,
    correctAnswer: question.correctAnswer,
  });

  const result = await applyXpChangeOnce({
    userId,
    sourceType: "test_hint_spend",
    sourceId: getHintSourceId(quizId, questionId, attemptId),
    xp: -QUIZ_HINT_XP_COST,
  });

  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return {
    quizId,
    questionId,
    attemptId,
    xpSpent: Math.abs(result.xpDelta),
    totalXp: user.totalXP,
    alreadyUsed: result.xpDelta === 0,
    hintCostXp: QUIZ_HINT_XP_COST,
    hiddenOptionIndexes: optionIndexesToHide,
    hiddenOptionValues: optionIndexesToHide.map((index) => question.options[index]),
    optionsToHide: optionIndexesToHide.map((index) => ({
      index,
      value: question.options[index],
    })),
  };
};
