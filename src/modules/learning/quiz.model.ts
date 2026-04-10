import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    lessonId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const Quiz = mongoose.model("Quiz", QuizSchema);

