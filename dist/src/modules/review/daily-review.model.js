"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewQuestionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ["multiple_choice", "true_false", "translation"],
        required: true,
    },
    prompt: { type: String, required: true, trim: true },
    helper: { type: String, default: "", trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "", trim: true },
    xpReward: { type: Number, required: true, default: 0 },
    order: { type: Number, required: true },
}, { _id: false });
const DailyReviewSchema = new mongoose_1.default.Schema({
    reviewId: { type: String, required: true, unique: true, index: true },
    dateKey: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    questions: { type: [ReviewQuestionSchema], default: [] },
}, { timestamps: true });
exports.DailyReview = mongoose_1.default.model("DailyReview", DailyReviewSchema);
