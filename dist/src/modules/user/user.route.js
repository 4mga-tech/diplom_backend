"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authMiddleware, user_controller_1.getProfile);
router.patch("/profile", auth_middleware_1.authMiddleware, user_controller_1.updateProfile);
exports.default = router;
