import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getTodayReviewHandler, submitTodayReviewHandler } from "./review.controller";

const router = Router();

router.get("/review/today", authMiddleware, getTodayReviewHandler);
router.post("/review/submit", authMiddleware, submitTodayReviewHandler);

export default router;
