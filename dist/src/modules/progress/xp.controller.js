"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimDailyLoginXpHandler = exports.getXpHistoryHandler = exports.getXpSummaryHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const xp_service_1 = require("./xp.service");
const getXpSummaryHandler = async (req, res) => {
    try {
        const data = await (0, xp_service_1.getXpSummary)(req.userId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getXpSummaryHandler = getXpSummaryHandler;
const getXpHistoryHandler = async (req, res) => {
    try {
        const rawLimit = Number(req.query.limit ?? 50);
        const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
        const data = await (0, xp_service_1.getXpHistory)(req.userId, limit);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getXpHistoryHandler = getXpHistoryHandler;
const claimDailyLoginXpHandler = async (req, res) => {
    try {
        const data = await (0, xp_service_1.claimDailyLoginXp)(req.userId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.claimDailyLoginXpHandler = claimDailyLoginXpHandler;
