import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["speaking", "vocabulary", "listening", "grammar", "quiz"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LessonSchema.index({ packageId: 1, order: 1 });

export const Lesson = mongoose.model("Lesson", LessonSchema);
