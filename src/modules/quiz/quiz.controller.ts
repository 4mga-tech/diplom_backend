import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import { AnswerPayload } from "../progress/progress.types";
import { submitQuiz } from "./quiz.service";

type UserRequest = Request & { userId?: string };

export const submitQuizHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const answers = (req.body.answers ?? []) as AnswerPayload[];
    const quizId = req.params.quizId as string;
    const data = await submitQuiz(req.userId!, quizId, answers);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
