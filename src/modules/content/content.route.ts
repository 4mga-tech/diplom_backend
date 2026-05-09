import { Router } from "express";
import {
  fetchLevels,
  
  fetchVocabularyLevel,
  fetchVocabularyLevels,
} from "./content.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/vocabulary/:levelId", fetchVocabularyLevel);
router.get("/vocabulary", fetchVocabularyLevels);
router.get("/vocabulary-levels", fetchVocabularyLevels);
router.get("/levels", authMiddleware, fetchLevels);

export default router;
