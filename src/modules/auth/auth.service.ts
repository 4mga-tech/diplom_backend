import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { Otp } from "./otp.model";
import { generateOtp } from "../../utils/otp";
import { sendOtpEmail } from "../../services/mail.service";

const OTP_EXPIRE_MS = 5 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createHttpError = (message: string, statusCode = 400) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const normalizeEmailOrThrow = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw createHttpError("Email is required", 400);
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createHttpError("Email format is invalid", 400);
  }

  return normalizedEmail;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  const token = generateToken({ userId: user._id.toString() });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ userId: user._id.toString() });

  return { user, token };
};

export const requestRegisterOtp = async (email: string) => {
  const normalizedEmail = normalizeEmailOrThrow(email);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createHttpError("Email already in use", 400);
  }

  const code = generateOtp();

  await Otp.findOneAndUpdate(
    { email: normalizedEmail, purpose: "register" },
    {
      $set: {
        code,
        expiresAt: new Date(Date.now() + OTP_EXPIRE_MS),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  await sendOtpEmail(normalizedEmail, code, "register");

  return { message: "OTP sent to email" };
};

export const verifyRegisterOtp = async (
  name: string,
  email: string,
  password: string,
  code: string,
) => {
  const normalizedEmail = normalizeEmailOrThrow(email);

  const otpDoc = await Otp.findOne({
    email: normalizedEmail,
    purpose: "register",
  });

  if (!otpDoc) {
    throw createHttpError("OTP not found", 400);
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    throw createHttpError("OTP expired", 400);
  }

  if (otpDoc.code !== code.trim()) {
    throw createHttpError("Invalid OTP", 400);
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createHttpError("Email already in use", 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  await Otp.deleteOne({ _id: otpDoc._id });

  const token = generateToken({ userId: user._id.toString() });

  return { user, token };
};

export const requestResetOtp = async (email: string) => {
  const normalizedEmail = normalizeEmailOrThrow(email);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw createHttpError("User not found", 404);
  }

  const code = generateOtp();

  await Otp.findOneAndUpdate(
    { email: normalizedEmail, purpose: "reset_password" },
    {
      $set: {
        code,
        expiresAt: new Date(Date.now() + OTP_EXPIRE_MS),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  await sendOtpEmail(normalizedEmail, code, "reset_password");

  return { message: "OTP sent to email" };
};

export const verifyResetOtp = async (
  email: string,
  code: string,
  newPassword: string,
) => {
  const normalizedEmail = normalizeEmailOrThrow(email);

  const otpDoc = await Otp.findOne({
    email: normalizedEmail,
    purpose: "reset_password",
  });

  if (!otpDoc) {
    throw createHttpError("OTP not found", 400);
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    throw createHttpError("OTP expired", 400);
  }

  if (otpDoc.code !== code.trim()) {
    throw createHttpError("Invalid OTP", 400);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw createHttpError("User not found", 404);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteOne({ _id: otpDoc._id });

  return { message: "Password updated successfully" };
};
