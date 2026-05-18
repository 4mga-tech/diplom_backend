import mongoose from "mongoose";

const GameAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    gameId: { type: String, required: true, index: true },
    levelId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    xpEarned: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

GameAttemptSchema.index({ userId: 1, gameId: 1, createdAt: -1 });
GameAttemptSchema.index({ userId: 1, createdAt: -1 });

export const GameAttempt = mongoose.model("GameAttempt", GameAttemptSchema);
