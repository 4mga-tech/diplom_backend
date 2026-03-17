import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PackageSchema.index({ levelId: 1, order: 1 });

export const Package = mongoose.model("Package", PackageSchema);