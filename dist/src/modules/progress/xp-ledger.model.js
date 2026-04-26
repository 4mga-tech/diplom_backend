"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XP_SOURCE_TYPES = exports.XpLedger = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const XP_SOURCE_TYPES = [
    "daily_login",
    "lesson_study",
    "quiz_reward",
    "review_reward",
    "test_hint_spend",
    "lesson_complete",
    "quiz_submit",
    "review_submit",
];
exports.XP_SOURCE_TYPES = XP_SOURCE_TYPES;
const XpLedgerSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    sourceType: {
        type: String,
        enum: XP_SOURCE_TYPES,
        required: true,
    },
    sourceId: { type: String, required: true },
    xp: { type: Number, required: true, default: 0 },
}, { timestamps: true });
XpLedgerSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });
XpLedgerSchema.index({ userId: 1, createdAt: -1 });
exports.XpLedger = mongoose_1.default.model("XpLedger", XpLedgerSchema);
