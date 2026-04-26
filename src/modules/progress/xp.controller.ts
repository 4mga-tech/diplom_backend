import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import { claimDailyLoginXp, getXpHistory, getXpSummary } from "./xp.service";

type UserRequest = Request & { userId?: string };

export const getXpSummaryHandler = async (req: UserRequest, res: Response) => {
  try {
    const data = await getXpSummary(req.userId!);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getXpHistoryHandler = async (req: UserRequest, res: Response) => {
  try {
    const rawLimit = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    const data = await getXpHistory(req.userId!, limit);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const claimDailyLoginXpHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const data = await claimDailyLoginXp(req.userId!);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
