import mongoose from "mongoose";

const XP_SOURCE_TYPES = [
  "daily_login",
  "lesson_study",
  "quiz_reward",
  "review_reward",
  "test_hint_spend",
  "lesson_complete",
  "quiz_submit",
  "review_submit",
] as const;

const XpLedgerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    sourceType: {
      type: String,
      enum: XP_SOURCE_TYPES,
      required: true,
    },
    sourceId: { type: String, required: true },
    xp: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

XpLedgerSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });
XpLedgerSchema.index({ userId: 1, createdAt: -1 });

export const XpLedger = mongoose.model("XpLedger", XpLedgerSchema);
export { XP_SOURCE_TYPES };
