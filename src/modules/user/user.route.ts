import { Router } from "express";
import { getProfile, updateProfile } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);

export default router;