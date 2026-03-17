import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema(
  {
    levelNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LevelSchema.index({ order: 1 });

export const Level = mongoose.model("Level", LevelSchema);
