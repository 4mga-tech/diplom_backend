import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import {
  getLevelTestQuestions,
  listLevelTests,
  listLevelTestTypes,
  submitLevelTest,
} from "./test.service";

type UserRequest = Request & { userId?: string };

export const getLevelTestsHandler = async (_req: Request, res: Response) => {
  try {
    const data = await listLevelTests();
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLevelTestTypesHandler = async (req: Request, res: Response) => {
  try {
    const data = await listLevelTestTypes(String(req.params.levelId));
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLevelTestQuestionsHandler = async (req: Request, res: Response) => {
  try {
    const data = await getLevelTestQuestions(
      String(req.params.levelId),
      String(req.params.testType),
    );
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const submitLevelTestHandler = async (req: UserRequest, res: Response) => {
  try {
    const data = await submitLevelTest(
      req.userId!,
      String(req.params.levelId),
      String(req.params.testType),
      Array.isArray(req.body.answers) ? req.body.answers : [],
    );
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
