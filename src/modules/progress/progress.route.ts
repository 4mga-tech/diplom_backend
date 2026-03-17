import { Router } from "express";
import {
  completeLessonHandler,
  levelProgressHandler,
} from "./progress.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/lesson/:lessonId",
  authMiddleware,
  completeLessonHandler
);

router.get(
  "/level/:levelId",
  authMiddleware,
  levelProgressHandler
);

export default router;