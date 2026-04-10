"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PackageSchema = new mongoose_1.default.Schema({
    levelId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Level",
        required: true,
    },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });
PackageSchema.index({ levelId: 1, order: 1 });
exports.Package = mongoose_1.default.model("Package", PackageSchema);
