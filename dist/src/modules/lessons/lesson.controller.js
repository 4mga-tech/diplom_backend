"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLessonQuizHandler = exports.getLessonDetailHandler = exports.getUnitLessonsHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const lesson_service_1 = require("./lesson.service");
const getUnitLessonsHandler = async (req, res) => {
    try {
        const unitId = req.params.unitId;
        const data = await (0, lesson_service_1.getLessonsByUnit)(req.userId, unitId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getUnitLessonsHandler = getUnitLessonsHandler;
const getLessonDetailHandler = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const data = await (0, lesson_service_1.getLessonDetail)(req.userId, lessonId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getLessonDetailHandler = getLessonDetailHandler;
const getLessonQuizHandler = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const data = await (0, lesson_service_1.getLessonQuiz)(lessonId);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getLessonQuizHandler = getLessonQuizHandler;
