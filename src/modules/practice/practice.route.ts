import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getAllPracticeHandler,
  getPracticeDetailHandler,
  submitPracticeAttemptHandler,
} from "./practice.controller";

const router = Router();

router.get("/practice", authMiddleware, getAllPracticeHandler);
router.get("/practice/:practiceId", authMiddleware, getPracticeDetailHandler);
router.post("/practice/:practiceId/attempt", authMiddleware, submitPracticeAttemptHandler);

export default router;
