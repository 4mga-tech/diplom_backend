"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OtpSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: {
        type: String,
        enum: ["register", "reset_password"],
        required: true,
    },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.Otp = mongoose_1.default.model("Otp", OtpSchema);
