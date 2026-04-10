"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
router.get("/review/today", auth_middleware_1.authMiddleware, review_controller_1.getTodayReviewHandler);
router.post("/review/submit", auth_middleware_1.authMiddleware, review_controller_1.submitTodayReviewHandler);
exports.default = router;
