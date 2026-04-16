import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestResetOtp,
  verifyResetOtp,
} from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";

export const register = async (req: Request, res: Response) => {
  try {
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerRequestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const result = await requestRegisterOtp(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, code } = req.body;

    if (!name || !email || !password || !code) {
      return res.status(400).json({
        message: "Name, email, password and code are required",
      });
    }

    const result = await verifyRegisterOtp(name, email, password, code);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetRequestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const result = await requestResetOtp(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, code and newPassword are required",
      });
    }

    const result = await verifyResetOtp(email, code, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};