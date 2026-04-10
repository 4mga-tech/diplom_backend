import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    quizId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "translation"],
      required: true,
    },
    prompt: { type: String, required: true, trim: true },
    helper: { type: String, default: "", trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "", trim: true },
    xpReward: { type: Number, required: true, default: 0 },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

QuizQuestionSchema.index({ quizId: 1, order: 1 }, { unique: true });

export const QuizQuestion = mongoose.model("QuizQuestion", QuizQuestionSchema);

