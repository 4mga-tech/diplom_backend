"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimDailyLoginXp = exports.getXpHistory = exports.getXpSummary = exports.applyXpChangeOnce = void 0;
const progress_repository_1 = require("./progress.repository");
const DAILY_LOGIN_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAILY_LOGIN_XP = 10;
const getDailyLoginEligibility = (lastDailyLoginXpAt, now) => {
    if (!lastDailyLoginXpAt) {
        return {
            isEligible: true,
            nextEligibleAt: now,
        };
    }
    const nextEligibleAt = new Date(lastDailyLoginXpAt.getTime() + DAILY_LOGIN_WINDOW_MS);
    return {
        isEligible: nextEligibleAt.getTime() <= now.getTime(),
        nextEligibleAt,
    };
};
const applyXpChangeOnce = async ({ userId, sourceType, sourceId, xp, progress, }) => {
    const user = await (0, progress_repository_1.findUserById)(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (xp === 0) {
        return {
            xpDelta: 0,
            totalXp: user.totalXP,
        };
    }
    const existing = await (0, progress_repository_1.findXpLedgerEntry)(userId, sourceType, sourceId);
    if (existing) {
        return {
            xpDelta: 0,
            totalXp: user.totalXP,
        };
    }
    const nextTotalXp = user.totalXP + xp;
    if (nextTotalXp < 0) {
        throw new Error("Not enough XP");
    }
    await (0, progress_repository_1.createXpLedgerEntry)({ userId, sourceType, sourceId, xp });
    user.totalXP = nextTotalXp;
    await user.save();
    if (progress && xp > 0) {
        progress.totalXp += xp;
        await progress.save();
    }
    return {
        xpDelta: xp,
        totalXp: user.totalXP,
    };
};
exports.applyXpChangeOnce = applyXpChangeOnce;
const getXpSummary = async (userId) => {
    const user = await (0, progress_repository_1.findUserById)(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const { isEligible, nextEligibleAt } = getDailyLoginEligibility(user.lastDailyLoginXpAt ? new Date(user.lastDailyLoginXpAt) : null, new Date());
    return {
        totalXp: user.totalXP,
        lastDailyLoginXpAt: user.lastDailyLoginXpAt,
        dailyLogin: {
            isEligible,
            rewardXp: DEFAULT_DAILY_LOGIN_XP,
            nextEligibleAt,
        },
    };
};
exports.getXpSummary = getXpSummary;
const getXpHistory = async (userId, limit = 50) => {
    const entries = await (0, progress_repository_1.listXpLedgerEntries)(userId, limit);
    return {
        items: entries.map((entry) => ({
            id: String(entry._id),
            amount: entry.xp,
            source: entry.sourceType,
            sourceId: entry.sourceId,
            timestamp: entry.createdAt,
        })),
    };
};
exports.getXpHistory = getXpHistory;
const claimDailyLoginXp = async (userId, rewardXp = DEFAULT_DAILY_LOGIN_XP) => {
    const now = new Date();
    const eligibleBefore = new Date(now.getTime() - DAILY_LOGIN_WINDOW_MS);
    const claimedUser = await (0, progress_repository_1.claimDailyLoginRewardWindow)(userId, now, eligibleBefore);
    if (!claimedUser) {
        const currentUser = await (0, progress_repository_1.findUserById)(userId);
        if (!currentUser) {
            throw new Error("User not found");
        }
        const { nextEligibleAt } = getDailyLoginEligibility(currentUser.lastDailyLoginXpAt ? new Date(currentUser.lastDailyLoginXpAt) : null, now);
        return {
            eligible: false,
            xpGained: 0,
            totalXp: currentUser.totalXP,
            lastClaimedAt: currentUser.lastDailyLoginXpAt,
            nextEligibleAt,
        };
    }
    const result = await (0, exports.applyXpChangeOnce)({
        userId,
        sourceType: "daily_login",
        sourceId: `daily_login:${now.toISOString()}`,
        xp: rewardXp,
    });
    return {
        eligible: true,
        xpGained: result.xpDelta,
        totalXp: result.totalXp,
        lastClaimedAt: claimedUser.lastDailyLoginXpAt,
        nextEligibleAt: new Date(now.getTime() + DAILY_LOGIN_WINDOW_MS),
    };
};
exports.claimDailyLoginXp = claimDailyLoginXp;
