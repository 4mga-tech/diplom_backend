"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizQuestion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QuizQuestionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true, index: true },
    quizId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ["multiple_choice", "true_false", "translation", "text_input"],
        required: true,
    },
    prompt: { type: String, required: true, trim: true },
    helper: { type: String, default: "", trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "", trim: true },
    xpReward: { type: Number, required: true, default: 0 },
    order: { type: Number, required: true },
}, { timestamps: true });
QuizQuestionSchema.index({ quizId: 1, order: 1 }, { unique: true });
exports.QuizQuestion = mongoose_1.default.model("QuizQuestion", QuizQuestionSchema);
