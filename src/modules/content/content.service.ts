import Level from "./level.model";
import levelManifest from "../../data/seed/lessons/levels_manifest.json";
import Vocabulary from "./vocabulary.model";
import { findUnitsByCourseId } from "../learning/learning.repository";
import { listUserProgress } from "../progress/progress.repository";
import {
  SUPPORTED_VOCABULARY_LEVEL_IDS,
  type SupportedVocabularyLevelId,
} from "./vocabulary.seed";

type LevelManifestEntry = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  order?: number;
  vocabularyReady?: boolean;
  vocabularyCount?: number;
};

type VocabularyWordResponse = {
  key: string;
  id: string;
  word: string;
  translation: string;
  level: string;
  type?: string;
  alphabetGroup?: string;
  orderInLevel?: number;
};

type VocabularyGroupResponse = {
  letter: string;
  level: string;
  count: number;
  words: VocabularyWordResponse[];
};

const SUPPORTED_VOCABULARY_LEVEL_SET = new Set<string>(SUPPORTED_VOCABULARY_LEVEL_IDS);

const normalizeVocabularyLevelId = (levelId: string) => levelId.trim().toLowerCase();

const levelManifestById = new Map(
  (levelManifest as LevelManifestEntry[]).map((level) => [level.id.toLowerCase(), level]),
);

const toVocabularyWordResponse = (word: any): VocabularyWordResponse => ({
  key: word.key,
  id: word.key,
  word: word.word,
  translation: word.translation ?? "",
  level: String(word.level).toUpperCase(),
  type: word.type ?? undefined,
  alphabetGroup: word.alphabetGroup ?? undefined,
  orderInLevel:
    typeof word.orderInLevel === "number" && Number.isFinite(word.orderInLevel)
      ? word.orderInLevel
      : undefined,
});

const groupVocabularyWords = (words: VocabularyWordResponse[]): VocabularyGroupResponse[] => {
  const groupedWords = new Map<string, VocabularyWordResponse[]>();

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

const buildVocabularyLevelResponse = async (levelId: SupportedVocabularyLevelId) => {
  const [levelRecord, vocabularyWords] = await Promise.all([
    Level.findOne({ id: levelId }).lean(),
    Vocabulary.find({ level: levelId }).sort({ orderInLevel: 1, word: 1 }).lean(),
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

export const getAllLevels = async () => {
  return Level.find().sort({ order: 1 });
};

export const getAllLevelsForUser = async (userId: string) => {
  const [levels, progressList] = await Promise.all([
    Level.find().sort({ order: 1 }).lean(),
    listUserProgress(userId),
  ]);

  const progressByCourseId = new Map(progressList.map((progress) => [progress.courseId, progress]));
  const unitsByCourseId = new Map(
    await Promise.all(
      levels.map(async (level) => [level.id, await findUnitsByCourseId(level.id)] as const),
    ),
  );

  const completedCourseIds = new Set(
    levels
      .filter((level) => {
        const units = unitsByCourseId.get(level.id) ?? [];
        if (units.length === 0) {
          return false;
        }

        const unitExamPassed = progressByCourseId.get(level.id)?.unitExamPassed ?? [];
        return units.every((unit) => unitExamPassed.includes(unit.id));
      })
      .map((level) => level.id),
  );

  return levels.map((level, index) => {
    const previousLevel = index > 0 ? levels[index - 1] : null;
    const isUnlocked = previousLevel ? completedCourseIds.has(previousLevel.id) : true;
    const units = unitsByCourseId.get(level.id) ?? [];
    const unitExamPassed = progressByCourseId.get(level.id)?.unitExamPassed ?? [];
    const isCompleted = units.length > 0 && units.every((unit) => unitExamPassed.includes(unit.id));

    return {
      ...level,
      isUnlocked,
      isCompleted,
    };
  });
};

export const getVocabularyLevels = async () => {
  return Promise.all(
    SUPPORTED_VOCABULARY_LEVEL_IDS.map((levelId) => buildVocabularyLevelResponse(levelId)),
  );
};

export const getVocabularyLevel = async (levelId: string) => {
  const normalizedLevelId = normalizeVocabularyLevelId(levelId);

  if (!SUPPORTED_VOCABULARY_LEVEL_SET.has(normalizedLevelId)) {
    throw new Error("Vocabulary level not found");
  }

  return buildVocabularyLevelResponse(normalizedLevelId as SupportedVocabularyLevelId);
};


