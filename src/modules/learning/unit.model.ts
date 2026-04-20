import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    courseId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true, default: "" },
    description: { type: String, required: true, trim: true, default: "" },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

UnitSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const Unit = mongoose.model("Unit", UnitSchema);
