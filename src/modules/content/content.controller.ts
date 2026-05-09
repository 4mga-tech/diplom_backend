import { Request, Response } from "express";
import {
  getAllLevels,
  getAllLevelsForUser,
  getVocabularyLevel,
 
  getVocabularyLevels,
} from "./content.service";

type UserRequest = Request & { userId?: string };

export const fetchLevels = async (req: UserRequest, res: Response) => {
  try {
    const levels = req.userId
      ? await getAllLevelsForUser(req.userId)
      : await getAllLevels();
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

export const fetchVocabularyLevel = async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;

    if (typeof levelId !== "string") {
      return res.status(400).json({ message: "Invalid levelId" });
    }

    const level = await getVocabularyLevel(levelId);
    res.json(level);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


