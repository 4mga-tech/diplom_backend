"use strict";
// import mongoose from "mongoose";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const LevelSchema = new mongoose.Schema(
//   {
//     levelNumber: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     title: { type: String, required: true },
//     description: { type: String },
//     order: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// );
// LevelSchema.index({ order: 1 });
// export const Level = mongoose.model("Level", LevelSchema);
const mongoose_1 = __importDefault(require("mongoose"));
const LevelSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    subtitle: String,
    description: String,
    vocabularyReady: Boolean,
    vocabularyCount: Number,
    order: Number,
    gradient: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length === 2,
            message: "gradient must contain exactly 2 colors",
        },
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Level", LevelSchema);
