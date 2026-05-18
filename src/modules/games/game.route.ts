import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getAllGamesHandler,
  getGameDetailHandler,
  submitGameAttemptHandler,
} from "./game.controller";

const router = Router();

router.get("/games", authMiddleware, getAllGamesHandler);
router.get("/games/:gameId", authMiddleware, getGameDetailHandler);
router.post("/games/:gameId/attempt", authMiddleware, submitGameAttemptHandler);

export default router;
