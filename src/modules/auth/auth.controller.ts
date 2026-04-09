import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";
import { resetPasswordService } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
        console.log("REGISTER BODY:", req.body);
console.log("schema:", registerSchema);
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const {name, email, password } = req.body;

    const result = await registerUser(name ,email, password);

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
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await resetPasswordService(email, password);

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};