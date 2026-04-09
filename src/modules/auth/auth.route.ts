import { Router } from "express";
import { register, login } from "./auth.controller";
import { resetPassword } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
export default router;