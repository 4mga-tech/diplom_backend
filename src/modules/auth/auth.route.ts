import { Router } from "express";
import {
  login,
  register,
  registerRequestOtp,
  registerVerifyOtp,
  resetRequestOtp,
  resetVerifyOtp,
} from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/register/request-otp", registerRequestOtp);
router.post("/register/verify-otp", registerVerifyOtp);

router.post("/reset/request-otp", resetRequestOtp);
router.post("/reset/verify-otp", resetVerifyOtp);

export default router;