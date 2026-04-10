import { Router } from "express";
import {
  completeLessonHandler,
  getCourseProgressHandler,
  getProgressSummaryHandler,
} from "./progress.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/me/progress/summary", authMiddleware, getProgressSummaryHandler);
router.get("/me/progress", authMiddleware, getCourseProgressHandler);
router.post("/lessons/:lessonId/complete", authMiddleware, completeLessonHandler);

export default router;
