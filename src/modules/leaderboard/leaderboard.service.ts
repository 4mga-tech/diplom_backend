import mongoose from "mongoose";
import { User } from "../user/user.model";

const LEADERBOARD_LIMIT = 5;

const ensureTotalXpIndex = async () => {
  await User.collection.createIndex({ totalXP: -1 });
};

export const getTopLeaderboard = async () => {
  await ensureTotalXpIndex();

  const users = await User.find({}, { name: 1, totalXP: 1 })
    .sort({ totalXP: -1, _id: 1 })
    .limit(LEADERBOARD_LIMIT)
    .lean();

  return users.map((user, index) => ({
    rank: index + 1,
    name: user.name,
    totalXP: user.totalXP ?? 0,
  }));
};

export const getUserRank = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  await ensureTotalXpIndex();

  const user = await User.findById(userId, { name: 1, totalXP: 1 }).lean();
  if (!user) {
    throw new Error("User not found");
  }

  const totalXP = user.totalXP ?? 0;
  const higherXpUsersCount = await User.countDocuments({ totalXP: { $gt: totalXP } });

  return {
    userId: String(user._id),
    name: user.name,
    totalXP,
    rank: higherXpUsersCount + 1,
  };
};

export const getLeaderboardSummary = async (userId: string) => {
  const [top5, me] = await Promise.all([getTopLeaderboard(), getUserRank(userId)]);

  return {
    top5,
    me: {
      rank: me.rank,
      totalXP: me.totalXP,
    },
  };
};