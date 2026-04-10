"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QuizSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true, index: true },
    lessonId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, required: true, default: 0 },
}, { timestamps: true });
exports.Quiz = mongoose_1.default.model("Quiz", QuizSchema);
