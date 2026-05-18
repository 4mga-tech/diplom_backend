import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    levelId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, required: true },
    maxDailyXp: { type: Number, required: true },
    dailyAttemptLimit: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    questions: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true },
);

export const Game = mongoose.model("Game", GameSchema);
