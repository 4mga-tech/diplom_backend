"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserActivity = exports.findUserById = exports.createXpLedgerEntry = exports.findXpLedgerEntry = exports.createQuizAttempt = exports.listUserProgress = exports.saveUserProgress = exports.createUserProgress = exports.findUserProgress = void 0;
const user_progress_model_1 = require("./user-progress.model");
const quiz_attempt_model_1 = require("./quiz-attempt.model");
const xp_ledger_model_1 = require("./xp-ledger.model");
const user_model_1 = require("../user/user.model");
const findUserProgress = (userId, courseId) => user_progress_model_1.UserProgress.findOne({ userId, courseId });
exports.findUserProgress = findUserProgress;
const createUserProgress = (userId, courseId, unlockedLessonIds) => user_progress_model_1.UserProgress.create({
    userId,
    courseId,
    completedLessonIds: [],
    unlockedLessonIds,
    totalXp: 0,
    streak: 0,
});
exports.createUserProgress = createUserProgress;
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
const findUserById = (userId) => user_model_1.User.findById(userId);
exports.findUserById = findUserById;
const updateUserActivity = (userId, payload) => user_model_1.User.findByIdAndUpdate(userId, payload, { new: true });
exports.updateUserActivity = updateUserActivity;
