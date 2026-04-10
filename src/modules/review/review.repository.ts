import { DailyReview } from "./daily-review.model";

export const findDailyReviewByDateKey = (dateKey: string) =>
  DailyReview.findOne({ dateKey }).lean();

export const findDailyReviewByReviewId = (reviewId: string) =>
  DailyReview.findOne({ reviewId }).lean();

