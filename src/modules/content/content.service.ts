import Level from "./level.model";
import { Package } from "./package.model";
import { Lesson } from "./lesson.model";
import levelManifest from "../../data/seed/levels_manifest.json";
import b1VocabularyGrouped from "../../data/seed/B1_vocabulary_app_grouped.json";
import m1VocabularyGrouped from "../../data/seed/m1_vocabulary_app_grouped.json";
import m2VocabularyGrouped from "../../data/seed/m2_vocabulary_app_grouped.json";
import m3VocabularyGrouped from "../../data/seed/m3_vocabulary_app_grouped.json";

type VocabularyWord = {
  key: string;
  word: string;
  translation: string;
  level: string;
  type: string;
  alphabetGroup: string;
  orderInLevel: number;
};

type VocabularyGroup = {
  letter: string;
  level: string;
  count: number;
  words: VocabularyWord[];
};

export const getAllLevels = async () => {
  return Level.find().sort({ order: 1 });
};

export const getVocabularyLevels = async () => {
  const vocabularySources: Record<string, VocabularyGroup[]> = {
    B1: b1VocabularyGrouped as VocabularyGroup[],
    M1: m1VocabularyGrouped as VocabularyGroup[],
    M2: m2VocabularyGrouped as VocabularyGroup[],
    M3: m3VocabularyGrouped as VocabularyGroup[],
  };

  return Object.entries(vocabularySources).map(([levelId, groups]) => {
    const manifestLevel = levelManifest.find((level) => level.id === levelId);
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
