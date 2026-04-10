import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { submitQuizHandler } from "./quiz.controller";

const router = Router();

router.post("/quizzes/:quizId/submit", authMiddleware, submitQuizHandler);

export default router;
