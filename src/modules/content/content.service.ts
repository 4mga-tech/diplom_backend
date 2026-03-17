import { Level } from "./level.model";
import { Package } from "./package.model";
import { Lesson } from "./lesson.model";

export const getAllLevels = async () => {
  return Level.find().sort({ order: 1 });
};

export const getLevelWithPackages = async (levelId: string) => {
  const level = await Level.findById(levelId);
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