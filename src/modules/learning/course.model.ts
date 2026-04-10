import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", CourseSchema);

