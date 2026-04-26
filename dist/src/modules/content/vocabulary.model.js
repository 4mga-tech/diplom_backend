"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VocabularySchema = new mongoose_1.default.Schema({
    key: { type: String, required: true },
    word: { type: String, required: true },
    translation: { type: String, default: "" },
    level: { type: String, required: true, lowercase: true },
    type: { type: String },
    alphabetGroup: { type: String },
    orderInLevel: { type: Number },
}, { timestamps: true });
VocabularySchema.index({ level: 1, orderInLevel: 1, word: 1 });
VocabularySchema.index({ level: 1, key: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Vocabulary", VocabularySchema);
