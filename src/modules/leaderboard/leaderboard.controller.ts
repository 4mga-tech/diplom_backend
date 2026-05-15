import { Request, Response } from "express";
import {
  getLeaderboardSummary,
  getTopLeaderboard,
  getUserRank,
} from "./leaderboard.service";

export const getTopLeaderboardHandler = async (_req: Request, res: Response) => {
  try {
    const data = await getTopLeaderboard();
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyRankHandler = async (req: Request, res: Response) => {
  try {
    const data = await getUserRank(String(req.params.userId));
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaderboardSummaryHandler = async (req: Request, res: Response) => {
  try {
    const data = await getLeaderboardSummary(String(req.params.userId));
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};