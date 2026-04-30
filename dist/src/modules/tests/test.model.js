"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelTest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TestOptionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
}, { _id: false });
const TestQuestionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, trim: true },
    levelId: {
        type: String,
        enum: ["m1", "m2", "m3", "m4"],
        required: true,
        lowercase: true,
        trim: true,
    },
    testType: {
        type: String,
        enum: ["vocabulary", "grammar"],
        required: true,
        lowercase: true,
        trim: true,
    },
    prompt: { type: String, required: true, trim: true },
    options: {
        type: [TestOptionSchema],
        validate: {
            validator: (options) => options.length >= 2,
            message: "Each test question must include at least 2 options",
        },
        default: [],
    },
    correctOptionId: { type: String, required: true, trim: true },
    explanation: { type: String, default: "", trim: true },
    order: { type: Number, required: true, min: 1 },
}, { _id: false });
const LevelTestSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true, index: true },
    levelId: {
        type: String,
        enum: ["m1", "m2", "m3", "m4"],
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    testType: {
        type: String,
        enum: ["vocabulary", "grammar"],
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    xpReward: { type: Number, required: true, min: 0, default: 0 },
    questions: {
        type: [TestQuestionSchema],
        validate: {
            validator: (questions) => questions.length >= 1,
            message: "Each level test must include at least one question",
        },
        default: [],
    },
}, { timestamps: true });
LevelTestSchema.index({ levelId: 1, testType: 1 }, { unique: true });
exports.LevelTest = mongoose_1.default.model("LevelTest", LevelTestSchema);
