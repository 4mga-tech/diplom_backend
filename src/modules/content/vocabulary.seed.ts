import m1VocabularyGrouped from "../../data/seed/m1_vocabulary_app_grouped.json";
import m2VocabularyGrouped from "../../data/seed/m2_vocabulary_app_grouped.json";
import m3VocabularyGrouped from "../../data/seed/m3_vocabulary_app_grouped.json";
import m4VocabularyGrouped from "../../data/seed/m4_vocabulary_app_grouped.json";

export const SUPPORTED_VOCABULARY_LEVEL_IDS = ["m1", "m2", "m3", "m4"] as const;

export type SupportedVocabularyLevelId = (typeof SUPPORTED_VOCABULARY_LEVEL_IDS)[number];

type RawVocabularyGroup = {
  letter?: unknown;
  level?: unknown;
  count?: unknown;
  words?: unknown;
};

type RawVocabularyWord = {
  key?: unknown;
  id?: unknown;
  word?: unknown;
  translation?: unknown;
  meaning?: unknown;
  level?: unknown;
  type?: unknown;
  alphabetGroup?: unknown;
  orderInLevel?: unknown;
};

export type VocabularySeedRecord = {
  key: string;
  word: string;
  translation: string;
  level: SupportedVocabularyLevelId;
  type?: string;
  alphabetGroup?: string;
  orderInLevel?: number;
};

const VOCABULARY_SOURCE_MAP: Record<SupportedVocabularyLevelId, unknown> = {
  m1: m1VocabularyGrouped,
  m2: m2VocabularyGrouped,
  m3: m3VocabularyGrouped,
  m4: m4VocabularyGrouped,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeRequiredString = (value: unknown, fieldName: string, context: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid vocabulary ${fieldName} at ${context}`);
  }

  return value.trim();
};

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeOptionalNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return undefined;
};

const normalizeVocabularyLevelId = (value: string) =>
  value.trim().toLowerCase() as SupportedVocabularyLevelId;

const normalizeVocabularyWord = (
  rawWord: unknown,
  fallbackLevelId: SupportedVocabularyLevelId,
  fallbackAlphabetGroup: string | undefined,
  seenKeys: Set<string>,
  context: string,
): VocabularySeedRecord | null => {
  if (!isRecord(rawWord)) {
    throw new Error(`Invalid vocabulary word at ${context}`);
  }

  const vocabularyWord = rawWord as RawVocabularyWord;
  const keyValue = vocabularyWord.key ?? vocabularyWord.id;
  const key = normalizeRequiredString(keyValue, "key/id", context);
  const word = normalizeRequiredString(vocabularyWord.word, "word", context);
  const translationSource = vocabularyWord.translation ?? vocabularyWord.meaning ?? "";

  if (
    vocabularyWord.translation !== undefined &&
    typeof vocabularyWord.translation !== "string"
  ) {
    throw new Error(`Invalid vocabulary translation at ${context}`);
  }

  if (vocabularyWord.meaning !== undefined && typeof vocabularyWord.meaning !== "string") {
    throw new Error(`Invalid vocabulary meaning at ${context}`);
  }

  const normalizedLevel =
    typeof vocabularyWord.level === "string" && vocabularyWord.level.trim().length > 0
      ? normalizeVocabularyLevelId(vocabularyWord.level)
      : fallbackLevelId;

  if (!SUPPORTED_VOCABULARY_LEVEL_IDS.includes(normalizedLevel)) {
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
    alphabetGroup:
      normalizeOptionalString(vocabularyWord.alphabetGroup) ??
      normalizeOptionalString(fallbackAlphabetGroup),
    orderInLevel: normalizeOptionalNumber(vocabularyWord.orderInLevel),
  } satisfies VocabularySeedRecord;
};

export const loadVocabularySeedRecords = () => {
  const seenKeys = new Set<string>();
  const records: VocabularySeedRecord[] = [];

  for (const levelId of SUPPORTED_VOCABULARY_LEVEL_IDS) {
    const groupedSource = VOCABULARY_SOURCE_MAP[levelId];

    if (!Array.isArray(groupedSource)) {
      throw new Error(`Vocabulary seed for ${levelId.toUpperCase()} must be an array`);
    }

    groupedSource.forEach((rawGroup, groupIndex) => {
      if (!isRecord(rawGroup)) {
        throw new Error(`Invalid vocabulary group at ${levelId.toUpperCase()}[${groupIndex}]`);
      }

      const vocabularyGroup = rawGroup as RawVocabularyGroup;
      const fallbackAlphabetGroup = normalizeOptionalString(vocabularyGroup.letter);
      const words = vocabularyGroup.words;

      if (!Array.isArray(words)) {
        throw new Error(`Vocabulary group missing words at ${levelId.toUpperCase()}[${groupIndex}]`);
      }

      words.forEach((rawWord, wordIndex) => {
        const record = normalizeVocabularyWord(
          rawWord,
          levelId,
          fallbackAlphabetGroup,
          seenKeys,
          `${levelId.toUpperCase()}[${groupIndex}].words[${wordIndex}]`,
        );

        if (record) {
          records.push(record);
        }
      });
    });
  }

  return records;
};

export const getVocabularyCountsByLevel = (records: VocabularySeedRecord[]) => {
  return records.reduce<Record<SupportedVocabularyLevelId, number>>(
    (counts, record) => {
      counts[record.level] += 1;
      return counts;
    },
    {
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
    },
  );
};
