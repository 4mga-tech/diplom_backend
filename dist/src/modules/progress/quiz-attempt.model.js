"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAttempt = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QuizAttemptSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    answers: { type: [mongoose_1.default.Schema.Types.Mixed], default: [] },
    correctCount: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    xpAwarded: { type: Number, required: true, default: 0 },
}, { timestamps: true });
QuizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });
exports.QuizAttempt = mongoose_1.default.model("QuizAttempt", QuizAttemptSchema);
