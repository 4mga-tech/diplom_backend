import mongoose from "mongoose";

const PracticeAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    practiceId: { type: String, required: true, index: true },
    levelId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    xpEarned: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

PracticeAttemptSchema.index({ userId: 1, practiceId: 1, createdAt: -1 });
PracticeAttemptSchema.index({ userId: 1, createdAt: -1 });

export const PracticeAttempt = mongoose.model("PracticeAttempt", PracticeAttemptSchema);
