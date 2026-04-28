import { Router } from "express";
import { getProfile, updateAvatar, updateProfile } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { avatarUploadMiddleware } from "../../middleware/avatarUpload.middleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, avatarUploadMiddleware, updateAvatar);

export default router;
