"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDailyReviewByReviewId = exports.findDailyReviewByDateKey = void 0;
const daily_review_model_1 = require("./daily-review.model");
const findDailyReviewByDateKey = (dateKey) => daily_review_model_1.DailyReview.findOne({ dateKey }).lean();
exports.findDailyReviewByDateKey = findDailyReviewByDateKey;
const findDailyReviewByReviewId = (reviewId) => daily_review_model_1.DailyReview.findOne({ reviewId }).lean();
exports.findDailyReviewByReviewId = findDailyReviewByReviewId;
