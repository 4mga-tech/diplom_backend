"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeLessonHandler = exports.getCourseProgressHandler = exports.getProgressSummaryHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const progress_service_1 = require("./progress.service");
const getProgressSummaryHandler = async (req, res) => {
    try {
        const data = await (0, progress_service_1.getProgressSummary)(req.userId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getProgressSummaryHandler = getProgressSummaryHandler;
const getCourseProgressHandler = async (req, res) => {
    try {
        const courseId = req.query.courseId;
        if (!courseId) {
            throw new Error("courseId is required");
        }
        const progress = await (0, progress_service_1.getCourseProgress)(req.userId, courseId);
        res.json((0, apiResponse_1.successResponse)({
            completedLessonIds: progress.completedLessonIds,
            unlockedLessonIds: progress.unlockedLessonIds,
            totalXp: progress.totalXp,
            streak: progress.streak,
        }));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getCourseProgressHandler = getCourseProgressHandler;
const completeLessonHandler = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const data = await (0, progress_service_1.completeLesson)(req.userId, lessonId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        console.log("COMPLETE LESSON ERROR:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.completeLessonHandler = completeLessonHandler;
