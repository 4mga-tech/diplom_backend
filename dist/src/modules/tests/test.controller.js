"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitLevelTestHandler = exports.getLevelTestQuestionsHandler = exports.getLevelTestTypesHandler = exports.getLevelTestsHandler = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const test_service_1 = require("./test.service");
const getLevelTestsHandler = async (_req, res) => {
    try {
        const data = await (0, test_service_1.listLevelTests)();
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getLevelTestsHandler = getLevelTestsHandler;
const getLevelTestTypesHandler = async (req, res) => {
    try {
        const data = await (0, test_service_1.listLevelTestTypes)(String(req.params.levelId));
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getLevelTestTypesHandler = getLevelTestTypesHandler;
const getLevelTestQuestionsHandler = async (req, res) => {
    try {
        const data = await (0, test_service_1.getLevelTestQuestions)(String(req.params.levelId), String(req.params.testType));
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getLevelTestQuestionsHandler = getLevelTestQuestionsHandler;
const submitLevelTestHandler = async (req, res) => {
    try {
        const data = await (0, test_service_1.submitLevelTest)(req.userId, String(req.params.levelId), String(req.params.testType), Array.isArray(req.body.answers) ? req.body.answers : []);
        res.json((0, apiResponse_1.successResponse)(data));
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.submitLevelTestHandler = submitLevelTestHandler;
