import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getLessonDetailHandler,
  getLessonQuizHandler,
  getUnitLessonsHandler,
} from "./lesson.controller";

const router = Router();

router.get("/units/:unitId/lessons", authMiddleware, getUnitLessonsHandler);
router.get("/lessons/:lessonId", authMiddleware, getLessonDetailHandler);
router.get("/lessons/:lessonId/quiz", authMiddleware, getLessonQuizHandler);

export default router;

