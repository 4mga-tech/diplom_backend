"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CourseSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
}, { timestamps: true });
exports.Course = mongoose_1.default.model("Course", CourseSchema);
