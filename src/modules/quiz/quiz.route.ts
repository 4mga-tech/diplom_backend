import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { spendQuizHintHandler, submitQuizHandler } from "./quiz.controller";

const router = Router();

router.post("/quizzes/:quizId/questions/:questionId/hint", authMiddleware, spendQuizHintHandler);
router.post("/quizzes/:quizId/submit", authMiddleware, submitQuizHandler);

export default router;
