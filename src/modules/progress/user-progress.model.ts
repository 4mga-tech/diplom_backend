import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    completedLessonIds: { type: [String], default: [] },
    unlockedLessonIds: { type: [String], default: [] },
    totalXp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserProgress = mongoose.model("UserProgress", UserProgressSchema);

