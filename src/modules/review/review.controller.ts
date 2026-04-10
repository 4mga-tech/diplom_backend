import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import { AnswerPayload } from "../progress/progress.types";
import { getTodayReview, submitTodayReview } from "./review.service";

type UserRequest = Request & { userId?: string };

export const getTodayReviewHandler = async (req: UserRequest, res: Response) => {
  try {
    const data = await getTodayReview(req.userId!);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const submitTodayReviewHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const data = await submitTodayReview(
      req.userId!,
      req.body.reviewId,
      (req.body.answers ?? []) as AnswerPayload[],
    );
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
