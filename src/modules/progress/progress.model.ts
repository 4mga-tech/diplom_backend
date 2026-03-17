import mongoose from "mongoose";
import { required } from "zod/v4/core/util.cjs";
import { tr } from "zod/v4/locales";

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", ProgressSchema);
