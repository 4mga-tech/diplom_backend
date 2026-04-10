"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const quiz_service_1 = require("./quiz.service");
const submitQuizHandler = async (req, res) => {
    try {
        const answers = (req.body.answers ?? []);
        const quizId = req.params.quizId;
        const data = await (0, quiz_service_1.submitQuiz)(req.userId, quizId, answers);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.submitQuizHandler = submitQuizHandler;
