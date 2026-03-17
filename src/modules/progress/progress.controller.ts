import { Request, Response } from "express";
import {
  completeLesson,
  getLevelProgress,
} from "./progress.service";

export const completeLessonHandler = async (
  req: Request<{ lessonId: string }>,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;
    const { lessonId } = req.params;
    const { score } = req.body;

    const result = await completeLesson(userId, lessonId, score);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const levelProgressHandler = async (
  req: Request<{ levelId: string }>,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;
    const { levelId } = req.params;

    const result = await getLevelProgress(userId, levelId);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};