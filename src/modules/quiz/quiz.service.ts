import { findLessonById, findUnitById } from "../learning/learning.repository";
import { getQuizForSubmission } from "../lessons/lesson.service";
import { awardXpOnce, syncUserStreak } from "../progress/progress.helpers";
import { createQuizAttempt, findUserProgress, listUserProgress } from "../progress/progress.repository";
import { AnswerPayload } from "../progress/progress.types";
import { getCourseProgress } from "../progress/progress.service";

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

const isAnswerCorrect = (selected: unknown, correctAnswer: unknown) =>
  normalizeAnswer(selected) === normalizeAnswer(correctAnswer);

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
    return count + (isAnswerCorrect(selected, question.correctAnswer) ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= quiz.passingScore;

  const progressState = await getCourseProgress(userId, unit.courseId);
  const progress = progressState.document;
  const totalAvailableXp = questions.reduce((sum, question) => sum + question.xpReward, 0);

  const xpResult = passed
    ? await awardXpOnce({
        userId,
        sourceType: "quiz_submit",
        sourceId: quizId,
        xp: Math.min(lesson.quizXpReward || totalAvailableXp, totalAvailableXp),
        progress,
      })
    : { xpGained: 0, totalXp: progress.totalXp };

  await createQuizAttempt({
    userId,
    quizId,
    lessonId: lesson.id,
    answers,
    correctCount,
    score,
    passed,
    xpAwarded: xpResult.xpGained,
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
    xpGained: xpResult.xpGained,
    totalXp: progress.totalXp,
  };
};
