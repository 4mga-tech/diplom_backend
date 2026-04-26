import mongoose from "mongoose";

const VocabularySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    word: { type: String, required: true },
    translation: { type: String, default: "" },
    level: { type: String, required: true, lowercase: true },
    type: { type: String },
    alphabetGroup: { type: String },
    orderInLevel: { type: Number },
  },
  { timestamps: true },
);

VocabularySchema.index({ level: 1, orderInLevel: 1, word: 1 });
VocabularySchema.index({ level: 1, key: 1 }, { unique: true });

export default mongoose.model("Vocabulary", VocabularySchema);
