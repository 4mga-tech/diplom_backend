import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    unitId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    xpReward: { type: Number, required: true, default: 0 },
    quizXpReward: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

LessonSchema.index({ unitId: 1, order: 1 }, { unique: true });

export const LearningLesson = mongoose.model("LearningLesson", LessonSchema);

