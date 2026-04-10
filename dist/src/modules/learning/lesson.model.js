"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningLesson = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LessonSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true, index: true },
    unitId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    xpReward: { type: Number, required: true, default: 0 },
    quizXpReward: { type: Number, required: true, default: 0 },
}, { timestamps: true });
LessonSchema.index({ unitId: 1, order: 1 }, { unique: true });
exports.LearningLesson = mongoose_1.default.model("LearningLesson", LessonSchema);
