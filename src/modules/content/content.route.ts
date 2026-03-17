import { Router } from "express";
import {
  fetchLevels,
  fetchLevel,
  fetchPackage,
} from "./content.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/levels", authMiddleware, fetchLevels);
router.get("/level/:levelId", authMiddleware, fetchLevel);
router.get("/package/:packageId", authMiddleware, fetchPackage);

export default router;