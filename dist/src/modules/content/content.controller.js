"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackage = exports.fetchLevel = exports.fetchVocabularyLevel = exports.fetchVocabularyLevels = exports.fetchLevels = void 0;
const content_service_1 = require("./content.service");
const fetchLevels = async (_req, res) => {
    try {
        const levels = await (0, content_service_1.getAllLevels)();
        res.json(levels);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.fetchLevels = fetchLevels;
const fetchVocabularyLevels = async (_req, res) => {
    try {
        const levels = await (0, content_service_1.getVocabularyLevels)();
        res.json(levels);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.fetchVocabularyLevels = fetchVocabularyLevels;
const fetchVocabularyLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        if (typeof levelId !== "string") {
            return res.status(400).json({ message: "Invalid levelId" });
        }
        const level = await (0, content_service_1.getVocabularyLevel)(levelId);
        res.json(level);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.fetchVocabularyLevel = fetchVocabularyLevel;
const fetchLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        if (typeof levelId !== "string") {
            return res.status(400).json({ message: "Invalid levelId" });
        }
        const result = await (0, content_service_1.getLevelWithPackages)(levelId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.fetchLevel = fetchLevel;
const fetchPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        if (typeof packageId !== "string") {
            return res.status(400).json({ message: "Invalid packageId" });
        }
        const result = await (0, content_service_1.getPackageWithLessons)(packageId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.fetchPackage = fetchPackage;
