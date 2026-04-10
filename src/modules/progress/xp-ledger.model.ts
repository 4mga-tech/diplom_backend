import mongoose from "mongoose";

const XpLedgerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    sourceType: {
      type: String,
      enum: ["lesson_complete", "quiz_submit", "review_submit"],
      required: true,
    },
    sourceId: { type: String, required: true },
    xp: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

XpLedgerSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export const XpLedger = mongoose.model("XpLedger", XpLedgerSchema);

