import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getLevelTestQuestionsHandler,
  getLevelTestsHandler,
  getLevelTestTypesHandler,
  submitLevelTestHandler,
} from "./test.controller";

const router = Router();

router.get("/levels", getLevelTestsHandler);
router.get("/:levelId/types", getLevelTestTypesHandler);
router.get("/:levelId/:testType/questions", getLevelTestQuestionsHandler);
router.post("/:levelId/:testType/submit", authMiddleware, submitLevelTestHandler);

export default router;
