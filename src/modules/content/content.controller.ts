import { Request, Response } from "express";
import {
  getAllLevels,
  getLevelWithPackages,
  getPackageWithLessons,
  getVocabularyLevels,
} from "./content.service";

export const fetchLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await getAllLevels();
    res.json(levels);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchVocabularyLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await getVocabularyLevels();
    res.json(levels);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchLevel = async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;

    if (typeof levelId !== "string") {
      return res.status(400).json({ message: "Invalid levelId" });
    }

    const result = await getLevelWithPackages(levelId);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
export const fetchPackage = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;

    if (typeof packageId !== "string") {
      return res.status(400).json({ message: "Invalid packageId" });
    }

    const result = await getPackageWithLessons(packageId);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
