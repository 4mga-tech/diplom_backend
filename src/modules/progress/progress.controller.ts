import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse";
import { completeLesson, getCourseProgress, getProgressSummary } from "./progress.service";

type UserRequest = Request & { userId?: string };

export const getProgressSummaryHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const data = await getProgressSummary(req.userId!);
    res.json(successResponse(data));
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCourseProgressHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    if (!courseId) {
      throw new Error("courseId is required");
    }

    const progress = await getCourseProgress(req.userId!, courseId);
    res.json(
      successResponse({
        completedLessonIds: progress.completedLessonIds,
        unlockedLessonIds: progress.unlockedLessonIds,
        totalXp: progress.totalXp,
        streak: progress.streak,
      }),
    );
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const completeLessonHandler = async (
  req: UserRequest,
  res: Response,
) => {
  try {
    const lessonId = req.params.lessonId as string;
    const data = await completeLesson(req.userId!, lessonId);
    res.json(successResponse(data));
  } catch (error: any) {
  console.log("COMPLETE LESSON ERROR:", error);
  res.status(400).json({ success: false, message: error.message });
}
};
