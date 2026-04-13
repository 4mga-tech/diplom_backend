"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageWithLessons = exports.getLevelWithPackages = exports.getVocabularyLevels = exports.getAllLevels = void 0;
const level_model_1 = __importDefault(require("./level.model"));
const package_model_1 = require("./package.model");
const lesson_model_1 = require("./lesson.model");
const levels_manifest_json_1 = __importDefault(require("../../data/seed/levels_manifest.json"));
const B1_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/B1_vocabulary_app_grouped.json"));
const m1_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m1_vocabulary_app_grouped.json"));
const m2_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m2_vocabulary_app_grouped.json"));
const m3_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m3_vocabulary_app_grouped.json"));
const getAllLevels = async () => {
    return level_model_1.default.find().sort({ order: 1 });
};
exports.getAllLevels = getAllLevels;
const getVocabularyLevels = async () => {
    const vocabularySources = {
        B1: B1_vocabulary_app_grouped_json_1.default,
        M1: m1_vocabulary_app_grouped_json_1.default,
        M2: m2_vocabulary_app_grouped_json_1.default,
        M3: m3_vocabulary_app_grouped_json_1.default,
    };
    return Object.entries(vocabularySources).map(([levelId, groups]) => {
        const manifestLevel = levels_manifest_json_1.default.find((level) => level.id === levelId);
        const words = groups.flatMap((group) => group.words);
        return {
            id: levelId,
            title: manifestLevel?.title ?? levelId,
            subtitle: manifestLevel?.subtitle ?? levelId,
            description: manifestLevel?.description ?? "",
            vocabularyCount: words.length,
            vocabularyReady: true,
            words,
        };
    });
};
exports.getVocabularyLevels = getVocabularyLevels;
const getLevelWithPackages = async (levelId) => {
    const level = await level_model_1.default.findOne({ id: levelId });
    if (!level)
        throw new Error("Level not found");
    const packages = await package_model_1.Package.find({ levelId }).sort({ order: 1 });
    return { level, packages };
};
exports.getLevelWithPackages = getLevelWithPackages;
const getPackageWithLessons = async (packageId) => {
    const pack = await package_model_1.Package.findById(packageId);
    if (!pack)
        throw new Error("Package not found");
    const lessons = await lesson_model_1.Lesson.find({ packageId }).sort({ order: 1 });
    return { pack, lessons };
};
exports.getPackageWithLessons = getPackageWithLessons;
