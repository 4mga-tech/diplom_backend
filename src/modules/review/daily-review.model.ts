import mongoose from "mongoose";

const ReviewQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
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
  { _id: false },
);

const DailyReviewSchema = new mongoose.Schema(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    dateKey: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    questions: { type: [ReviewQuestionSchema], default: [] },
  },
  { timestamps: true },
);

export const DailyReview = mongoose.model("DailyReview", DailyReviewSchema);

