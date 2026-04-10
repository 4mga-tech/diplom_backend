import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import { getLessonDetail, getLessonQuiz, getLessonsByUnit } from "./lesson.service";

type UserRequest = Request & { userId?: string };

export const getUnitLessonsHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const unitId = req.params.unitId as string;
    const data = await getLessonsByUnit(req.userId!, unitId);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLessonDetailHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const lessonId = req.params.lessonId as string;
    const data = await getLessonDetail(req.userId!, lessonId);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLessonQuizHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const lessonId = req.params.lessonId as string;
    const data = await getLessonQuiz(lessonId);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
