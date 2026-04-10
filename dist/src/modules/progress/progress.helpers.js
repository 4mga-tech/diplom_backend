"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUserStreak = exports.awardXpOnce = void 0;
const progress_repository_1 = require("./progress.repository");
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const awardXpOnce = async ({ userId, sourceType, sourceId, xp, progress, }) => {
    if (xp <= 0) {
        return { xpGained: 0, totalXp: progress?.totalXp ?? 0 };
    }
    const existing = await (0, progress_repository_1.findXpLedgerEntry)(userId, sourceType, sourceId);
    if (existing) {
        return { xpGained: 0, totalXp: progress?.totalXp ?? 0 };
    }
    await (0, progress_repository_1.createXpLedgerEntry)({ userId, sourceType, sourceId, xp });
    if (progress) {
        progress.totalXp += xp;
        await progress.save();
    }
    const user = await (0, progress_repository_1.findUserById)(userId);
    if (user) {
        user.totalXP += xp;
        await user.save();
    }
    return { xpGained: xp, totalXp: progress?.totalXp ?? user?.totalXP ?? xp };
};
exports.awardXpOnce = awardXpOnce;
const syncUserStreak = async ({ userId, progresses, activityDate = new Date(), }) => {
    const user = await (0, progress_repository_1.findUserById)(userId);
    if (!user) {
        return { streak: 0 };
    }
    const today = startOfDay(activityDate);
    const lastActive = user.lastActiveAt ? startOfDay(new Date(user.lastActiveAt)) : null;
    if (!lastActive) {
        user.streak = 1;
    }
    else if (lastActive.getTime() === today.getTime()) {
        return { streak: user.streak };
    }
    else if (addDays(lastActive, 1).getTime() === today.getTime()) {
        user.streak += 1;
    }
    else {
        user.streak = 1;
    }
    user.lastActiveAt = today;
    await user.save();
    await Promise.all(progresses.map(async (progress) => {
        progress.streak = user.streak;
        await progress.save();
    }));
    return { streak: user.streak };
};
exports.syncUserStreak = syncUserStreak;
