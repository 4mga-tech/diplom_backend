export type QuestionType = "multiple_choice" | "true_false" | "translation";

export type AnswerPayload = {
  questionId: string;
  selected: string | boolean | null;
};

