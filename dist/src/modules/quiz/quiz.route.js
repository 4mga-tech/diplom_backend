"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const quiz_controller_1 = require("./quiz.controller");
const router = (0, express_1.Router)();
router.post("/quizzes/:quizId/submit", auth_middleware_1.authMiddleware, quiz_controller_1.submitQuizHandler);
exports.default = router;
