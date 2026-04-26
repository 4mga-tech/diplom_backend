export type QuestionType = "multiple_choice" | "true_false" | "translation";

export type AnswerPayload = {
  questionId: string;
  selected: string | boolean | null;
};

export type XpSourceType =
  | "daily_login"
  | "lesson_study"
  | "quiz_reward"
  | "review_reward"
  | "test_hint_spend"
  | "lesson_complete"
  | "quiz_submit"
  | "review_submit";
