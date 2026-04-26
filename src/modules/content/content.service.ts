import Level from "./level.model";
import { Package } from "./package.model";
import { Lesson } from "./lesson.model";
import levelManifest from "../../data/seed/lessons/levels_manifest.json";
import Vocabulary from "./vocabulary.model";
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

export const getLevelWithPackages = async (levelId: string) => {
  const level = await Level.findOne({ id: levelId });
  if (!level) throw new Error("Level not found");

  const packages = await Package.find({ levelId }).sort({ order: 1 });

  return { level, packages };
};

export const getPackageWithLessons = async (packageId: string) => {
  const pack = await Package.findById(packageId);
  if (!pack) throw new Error("Package not found");

  const lessons = await Lesson.find({ packageId }).sort({ order: 1 });

  return { pack, lessons };
};
