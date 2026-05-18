import { Request, Response } from "express";
import { findAllActiveGames } from "./game.repository";
import { getGameDetail, submitGameAttempt } from "./game.service";

export const getAllGamesHandler = async (req: Request, res: Response) => {
  try {
    const games = await findAllActiveGames();
    return res.status(200).json({
      success: true,
      data: games.map((game) => ({
        id: game.id,
        type: game.type,
        levelId: game.levelId,
        title: game.title,
        subtitle: game.subtitle,
        description: game.description,
        xpReward: game.xpReward,
        maxDailyXp: game.maxDailyXp,
        dailyAttemptLimit: game.dailyAttemptLimit,
        order: game.order,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getGameDetailHandler = async (req: Request, res: Response) => {
  try {
    const gameId = String(req.params.gameId ?? "");
    const game = await getGameDetail(gameId);
    return res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message === "Game not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const submitGameAttemptHandler = async (req: Request, res: Response) => {
  try {
    const gameId = String(req.params.gameId ?? "");
    const { score, correctCount, totalCount } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    if (score === undefined || correctCount === undefined || totalCount === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: score, correctCount, totalCount",
      });
    }

    const result = await submitGameAttempt(userId, gameId, {
      score,
      correctCount,
      totalCount,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message === "Game not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
