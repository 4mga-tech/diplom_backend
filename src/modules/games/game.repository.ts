import { Game } from "./game.model";
import { GameAttempt } from "./game-attempt.model";
// import { startOfDay } from "date-fns";

function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export const findGameById = async (gameId: string) => {
  return Game.findOne({ id: gameId });
};

export const findAllActiveGames = async () => {
  return Game.find({ isActive: true }).sort({ order: 1 });
};

export const upsertGame = async (gameData: any) => {
  return Game.findOneAndUpdate(
    { id: gameData.id },
    gameData,
    { upsert: true, new: true },
  );
};

export const createGameAttempt = async (attempt: any) => {
  return GameAttempt.create(attempt);
};

export const findGameAttemptsByUserToday = async (userId: string, gameId: string) => {
  const today = getStartOfToday()
  return GameAttempt.find({
    userId,
    gameId,
    createdAt: { $gte: today },
  });
};

export const findGameAttemptsByUser = async (userId: string, gameId: string, limit = 50) => {
  return GameAttempt.find({ userId, gameId })
    .sort({ createdAt: -1 })
    .limit(limit);
};
