"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVocabularyCountsByLevel = exports.loadVocabularySeedRecords = exports.SUPPORTED_VOCABULARY_LEVEL_IDS = void 0;
const m1_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m1_vocabulary_app_grouped.json"));
const m2_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m2_vocabulary_app_grouped.json"));
const m3_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m3_vocabulary_app_grouped.json"));
const m4_vocabulary_app_grouped_json_1 = __importDefault(require("../../data/seed/m4_vocabulary_app_grouped.json"));
exports.SUPPORTED_VOCABULARY_LEVEL_IDS = ["m1", "m2", "m3", "m4"];
const VOCABULARY_SOURCE_MAP = {
    m1: m1_vocabulary_app_grouped_json_1.default,
    m2: m2_vocabulary_app_grouped_json_1.default,
    m3: m3_vocabulary_app_grouped_json_1.default,
    m4: m4_vocabulary_app_grouped_json_1.default,
};
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const normalizeRequiredString = (value, fieldName, context) => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`Invalid vocabulary ${fieldName} at ${context}`);
    }
    return value.trim();
};
const normalizeOptionalString = (value) => {
    if (typeof value !== "string") {
        return undefined;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
};
const normalizeOptionalNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    return undefined;
};
const normalizeVocabularyLevelId = (value) => value.trim().toLowerCase();
const normalizeVocabularyWord = (rawWord, fallbackLevelId, fallbackAlphabetGroup, seenKeys, context) => {
    if (!isRecord(rawWord)) {
        throw new Error(`Invalid vocabulary word at ${context}`);
    }
    const vocabularyWord = rawWord;
    const keyValue = vocabularyWord.key ?? vocabularyWord.id;
    const key = normalizeRequiredString(keyValue, "key/id", context);
    const word = normalizeRequiredString(vocabularyWord.word, "word", context);
    const translationSource = vocabularyWord.translation ?? vocabularyWord.meaning ?? "";
    if (vocabularyWord.translation !== undefined &&
        typeof vocabularyWord.translation !== "string") {
        throw new Error(`Invalid vocabulary translation at ${context}`);
    }
    if (vocabularyWord.meaning !== undefined && typeof vocabularyWord.meaning !== "string") {
        throw new Error(`Invalid vocabulary meaning at ${context}`);
    }
    const normalizedLevel = typeof vocabularyWord.level === "string" && vocabularyWord.level.trim().length > 0
        ? normalizeVocabularyLevelId(vocabularyWord.level)
        : fallbackLevelId;
    if (!exports.SUPPORTED_VOCABULARY_LEVEL_IDS.includes(normalizedLevel)) {
        throw new Error(`Unsupported vocabulary level "${vocabularyWord.level}" at ${context}`);
    }
    const dedupeKey = `${normalizedLevel}:${key.toLowerCase()}`;
    if (seenKeys.has(dedupeKey)) {
        return null;
    }
    seenKeys.add(dedupeKey);
    return {
        key,
        word,
        translation: typeof translationSource === "string" ? translationSource.trim() : "",
        level: normalizedLevel,
        type: normalizeOptionalString(vocabularyWord.type),
        alphabetGroup: normalizeOptionalString(vocabularyWord.alphabetGroup) ??
            normalizeOptionalString(fallbackAlphabetGroup),
        orderInLevel: normalizeOptionalNumber(vocabularyWord.orderInLevel),
    };
};
const loadVocabularySeedRecords = () => {
    const seenKeys = new Set();
    const records = [];
    for (const levelId of exports.SUPPORTED_VOCABULARY_LEVEL_IDS) {
        const groupedSource = VOCABULARY_SOURCE_MAP[levelId];
        if (!Array.isArray(groupedSource)) {
            throw new Error(`Vocabulary seed for ${levelId.toUpperCase()} must be an array`);
        }
        groupedSource.forEach((rawGroup, groupIndex) => {
            if (!isRecord(rawGroup)) {
                throw new Error(`Invalid vocabulary group at ${levelId.toUpperCase()}[${groupIndex}]`);
            }
            const vocabularyGroup = rawGroup;
            const fallbackAlphabetGroup = normalizeOptionalString(vocabularyGroup.letter);
            const words = vocabularyGroup.words;
            if (!Array.isArray(words)) {
                throw new Error(`Vocabulary group missing words at ${levelId.toUpperCase()}[${groupIndex}]`);
            }
            words.forEach((rawWord, wordIndex) => {
                const record = normalizeVocabularyWord(rawWord, levelId, fallbackAlphabetGroup, seenKeys, `${levelId.toUpperCase()}[${groupIndex}].words[${wordIndex}]`);
                if (record) {
                    records.push(record);
                }
            });
        });
    }
    return records;
};
exports.loadVocabularySeedRecords = loadVocabularySeedRecords;
const getVocabularyCountsByLevel = (records) => {
    return records.reduce((counts, record) => {
        counts[record.level] += 1;
        return counts;
    }, {
        m1: 0,
        m2: 0,
        m3: 0,
        m4: 0,
    });
};
exports.getVocabularyCountsByLevel = getVocabularyCountsByLevel;
