"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTodayReviewHandler = exports.getTodayReviewHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const review_service_1 = require("./review.service");
const getTodayReviewHandler = async (req, res) => {
    try {
        const data = await (0, review_service_1.getTodayReview)(req.userId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getTodayReviewHandler = getTodayReviewHandler;
const submitTodayReviewHandler = async (req, res) => {
    try {
        const data = await (0, review_service_1.submitTodayReview)(req.userId, req.body.reviewId, (req.body.answers ?? []));
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.submitTodayReviewHandler = submitTodayReviewHandler;
