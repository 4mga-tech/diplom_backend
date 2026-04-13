import { Router } from "express";
import {
  fetchLevels,
  fetchLevel,
  fetchPackage,
  fetchVocabularyLevels,
} from "./content.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/vocabulary-levels", fetchVocabularyLevels);
router.get("/levels", authMiddleware, fetchLevels);
router.get("/level/:levelId", authMiddleware, fetchLevel);
router.get("/package/:packageId", authMiddleware, fetchPackage);

export default router;
