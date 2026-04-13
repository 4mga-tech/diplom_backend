"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const level_model_1 = __importDefault(require("../modules/content/level.model"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const levels = await level_model_1.default.find().sort({ order: 1 });
        res.json(levels);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch levels" });
    }
});
exports.default = router;
