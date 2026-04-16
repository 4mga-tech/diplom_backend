import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { Otp } from "./otp.model";
import { generateOtp } from "../../utils/otp";
import { sendOtpEmail } from "../../services/mail.service";

const OTP_EXPIRE_MS = 5 * 60 * 1000;

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
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("Email already in use");
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
  const normalizedEmail = email.trim().toLowerCase();

  const otpDoc = await Otp.findOne({
    email: normalizedEmail,
    purpose: "register",
  });

  if (!otpDoc) {
    throw new Error("OTP not found");
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    throw new Error("OTP expired");
  }

  if (otpDoc.code !== code.trim()) {
    throw new Error("Invalid OTP");
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("Email already in use");
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
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("User not found");
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
  const normalizedEmail = email.trim().toLowerCase();

  const otpDoc = await Otp.findOne({
    email: normalizedEmail,
    purpose: "reset_password",
  });

  if (!otpDoc) {
    throw new Error("OTP not found");
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    throw new Error("OTP expired");
  }

  if (otpDoc.code !== code.trim()) {
    throw new Error("Invalid OTP");
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("User not found");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteOne({ _id: otpDoc._id });

  return { message: "Password updated successfully" };
};