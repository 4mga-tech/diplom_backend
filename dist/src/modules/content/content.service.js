"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageWithLessons = exports.getLevelWithPackages = exports.getVocabularyLevel = exports.getVocabularyLevels = exports.getAllLevels = void 0;
const level_model_1 = __importDefault(require("./level.model"));
const package_model_1 = require("./package.model");
const lesson_model_1 = require("./lesson.model");
const levels_manifest_json_1 = __importDefault(require("../../data/seed/lessons/levels_manifest.json"));
const vocabulary_model_1 = __importDefault(require("./vocabulary.model"));
const vocabulary_seed_1 = require("./vocabulary.seed");
const SUPPORTED_VOCABULARY_LEVEL_SET = new Set(vocabulary_seed_1.SUPPORTED_VOCABULARY_LEVEL_IDS);
const normalizeVocabularyLevelId = (levelId) => levelId.trim().toLowerCase();
const levelManifestById = new Map(levels_manifest_json_1.default.map((level) => [level.id.toLowerCase(), level]));
const toVocabularyWordResponse = (word) => ({
    key: word.key,
    id: word.key,
    word: word.word,
    translation: word.translation ?? "",
    level: String(word.level).toUpperCase(),
    type: word.type ?? undefined,
    alphabetGroup: word.alphabetGroup ?? undefined,
    orderInLevel: typeof word.orderInLevel === "number" && Number.isFinite(word.orderInLevel)
        ? word.orderInLevel
        : undefined,
});
const groupVocabularyWords = (words) => {
    const groupedWords = new Map();
    for (const word of words) {
        const groupKey = word.alphabetGroup?.trim() || "#";
        const existing = groupedWords.get(groupKey) ?? [];
        existing.push(word);
        groupedWords.set(groupKey, existing);
    }
    return Array.from(groupedWords.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([letter, groupWords]) => ({
        letter,
        level: groupWords[0]?.level ?? "",
        count: groupWords.length,
        words: groupWords.sort((left, right) => {
            const leftOrder = left.orderInLevel ?? Number.MAX_SAFE_INTEGER;
            const rightOrder = right.orderInLevel ?? Number.MAX_SAFE_INTEGER;
            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }
            return left.word.localeCompare(right.word);
        }),
    }));
};
const buildVocabularyLevelResponse = async (levelId) => {
    const [levelRecord, vocabularyWords] = await Promise.all([
        level_model_1.default.findOne({ id: levelId }).lean(),
        vocabulary_model_1.default.find({ level: levelId }).sort({ orderInLevel: 1, word: 1 }).lean(),
    ]);
    const manifestLevel = levelManifestById.get(levelId);
    const words = vocabularyWords.map(toVocabularyWordResponse);
    return {
        id: levelId,
        title: levelRecord?.title ?? manifestLevel?.title ?? levelId.toUpperCase(),
        subtitle: levelRecord?.subtitle ?? manifestLevel?.subtitle ?? levelId.toUpperCase(),
        description: levelRecord?.description ?? manifestLevel?.description ?? "",
        vocabularyCount: words.length,
        vocabularyReady: words.length > 0,
        groups: groupVocabularyWords(words),
        words,
    };
};
const getAllLevels = async () => {
    return level_model_1.default.find().sort({ order: 1 });
};
exports.getAllLevels = getAllLevels;
const getVocabularyLevels = async () => {
    return Promise.all(vocabulary_seed_1.SUPPORTED_VOCABULARY_LEVEL_IDS.map((levelId) => buildVocabularyLevelResponse(levelId)));
};
exports.getVocabularyLevels = getVocabularyLevels;
const getVocabularyLevel = async (levelId) => {
    const normalizedLevelId = normalizeVocabularyLevelId(levelId);
    if (!SUPPORTED_VOCABULARY_LEVEL_SET.has(normalizedLevelId)) {
        throw new Error("Vocabulary level not found");
    }
    return buildVocabularyLevelResponse(normalizedLevelId);
};
exports.getVocabularyLevel = getVocabularyLevel;
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
