import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    correctCount: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    xpAwarded: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

QuizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

export const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);

