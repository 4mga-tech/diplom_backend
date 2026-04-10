"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LevelSchema = new mongoose_1.default.Schema({
    levelNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
}, { timestamps: true });
LevelSchema.index({ order: 1 });
exports.Level = mongoose_1.default.model("Level", LevelSchema);
