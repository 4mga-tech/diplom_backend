"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserActivity = exports.claimDailyLoginRewardWindow = exports.findUserById = exports.listXpLedgerEntries = exports.createXpLedgerEntry = exports.findXpLedgerEntry = exports.createQuizAttempt = exports.listUserProgress = exports.saveUserProgress = exports.findOrCreateUserProgress = exports.findUserProgress = void 0;
const user_progress_model_1 = require("./user-progress.model");
const quiz_attempt_model_1 = require("./quiz-attempt.model");
const xp_ledger_model_1 = require("./xp-ledger.model");
const user_model_1 = require("../user/user.model");
const findUserProgress = (userId, courseId) => user_progress_model_1.UserProgress.findOne({ userId, courseId });
exports.findUserProgress = findUserProgress;
const findOrCreateUserProgress = async (userId, courseId, unlockedLessonIds = []) => {
    return user_progress_model_1.UserProgress.findOneAndUpdate({ userId, courseId }, {
        $setOnInsert: {
            userId,
            courseId,
            completedLessonIds: [],
            unlockedLessonIds,
            totalXp: 0,
            streak: 0,
        },
    }, {
        returnDocument: "after",
        upsert: true,
    });
};
exports.findOrCreateUserProgress = findOrCreateUserProgress;
const saveUserProgress = (progress) => progress.save();
exports.saveUserProgress = saveUserProgress;
const listUserProgress = (userId) => user_progress_model_1.UserProgress.find({ userId }).lean();
exports.listUserProgress = listUserProgress;
const createQuizAttempt = (payload) => quiz_attempt_model_1.QuizAttempt.create(payload);
exports.createQuizAttempt = createQuizAttempt;
const findXpLedgerEntry = (userId, sourceType, sourceId) => xp_ledger_model_1.XpLedger.findOne({ userId, sourceType, sourceId }).lean();
exports.findXpLedgerEntry = findXpLedgerEntry;
const createXpLedgerEntry = (payload) => xp_ledger_model_1.XpLedger.create(payload);
exports.createXpLedgerEntry = createXpLedgerEntry;
const listXpLedgerEntries = (userId, limit = 50) => xp_ledger_model_1.XpLedger.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
exports.listXpLedgerEntries = listXpLedgerEntries;
const findUserById = (userId) => user_model_1.User.findById(userId);
exports.findUserById = findUserById;
const claimDailyLoginRewardWindow = (userId, claimedAt, eligibleBefore) => user_model_1.User.findOneAndUpdate({
    _id: userId,
    $or: [
        { lastDailyLoginXpAt: null },
        { lastDailyLoginXpAt: { $lte: eligibleBefore } },
    ],
}, {
    $set: {
        lastDailyLoginXpAt: claimedAt,
    },
}, { returnDocument: "after" });
exports.claimDailyLoginRewardWindow = claimDailyLoginRewardWindow;
const updateUserActivity = (userId, payload) => user_model_1.User.findByIdAndUpdate(userId, payload, { returnDocument: "after" });
exports.updateUserActivity = updateUserActivity;
