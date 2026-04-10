"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProgress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserProgressSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    completedLessonIds: { type: [String], default: [] },
    unlockedLessonIds: { type: [String], default: [] },
    totalXp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
}, { timestamps: true });
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
exports.UserProgress = mongoose_1.default.model("UserProgress", UserProgressSchema);
