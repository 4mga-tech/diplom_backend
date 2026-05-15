import { Router } from "express";
import {
  getLeaderboardSummaryHandler,
  getMyRankHandler,
  getTopLeaderboardHandler,
} from "./leaderboard.controller";

const router = Router();

router.get("/top", getTopLeaderboardHandler);
router.get("/me/:userId", getMyRankHandler);
router.get("/summary/:userId", getLeaderboardSummaryHandler);

export default router;