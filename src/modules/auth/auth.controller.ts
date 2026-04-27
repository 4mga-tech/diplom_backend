import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestResetOtp,
  verifyResetOtp,
} from "./auth.service";
import {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  registerVerifyOtpSchema,
  resetVerifyOtpSchema,
} from "./auth.validation";

const sendError = (res: Response, error: any) => {
  const status = error?.statusCode ?? 400;
  const message = error?.message ?? "Request failed";

  return res.status(status).json({ message });
};

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
    return sendError(res, error);
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
    return sendError(res, error);
  }
};

export const registerRequestOtp = async (req: Request, res: Response) => {
  try {
    const { error, value } = otpRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await requestRegisterOtp(value.email);
    res.json(result);
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const registerVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerVerifyOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await verifyRegisterOtp(
      value.name,
      value.email,
      value.password,
      value.code,
    );
    res.json(result);
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const resetRequestOtp = async (req: Request, res: Response) => {
  try {
    const { error, value } = otpRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await requestResetOtp(value.email);
    res.json(result);
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const resetVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { error, value } = resetVerifyOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await verifyResetOtp(
      value.email,
      value.code,
      value.newPassword,
    );
    res.json(result);
  } catch (error: any) {
    return sendError(res, error);
  }
};
