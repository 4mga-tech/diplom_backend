"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XpLedger = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const XpLedgerSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    sourceType: {
        type: String,
        enum: ["lesson_complete", "quiz_submit", "review_submit"],
        required: true,
    },
    sourceId: { type: String, required: true },
    xp: { type: Number, required: true, default: 0 },
}, { timestamps: true });
XpLedgerSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });
exports.XpLedger = mongoose_1.default.model("XpLedger", XpLedgerSchema);
