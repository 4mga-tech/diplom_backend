import { Router } from "express";
import {
  completeLessonHandler,
  getCourseProgressHandler,
  getProgressSummaryHandler,
} from "./progress.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  claimDailyLoginXpHandler,
  getXpHistoryHandler,
  getXpSummaryHandler,
} from "./xp.controller";

const router = Router();

router.get("/me/progress/summary", authMiddleware, getProgressSummaryHandler);
router.get("/me/progress", authMiddleware, getCourseProgressHandler);
router.get("/me/xp/summary", authMiddleware, getXpSummaryHandler);
router.get("/me/xp/history", authMiddleware, getXpHistoryHandler);
router.post("/me/xp/daily-login/claim", authMiddleware, claimDailyLoginXpHandler);
router.post("/me/xp/lessons/:lessonId/claim", authMiddleware, completeLessonHandler);
router.post("/lessons/:lessonId/complete", authMiddleware, completeLessonHandler);

export default router;
