"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LessonSchema = new mongoose_1.default.Schema({
    packageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Package",
        required: true,
    },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ["speaking", "vocabulary", "listening", "grammar", "quiz"],
        required: true,
    },
    content: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
    order: { type: Number, default: 0 },
}, { timestamps: true });
LessonSchema.index({ packageId: 1, order: 1 });
exports.Lesson = mongoose_1.default.model("Lesson", LessonSchema);
