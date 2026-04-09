import { User } from "../user/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";

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

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = generateToken({ id: user._id });

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

  const token = generateToken({ userId: user._id });

  return { user, token };
};
export const resetPasswordService = async (
  email: string,
  newPassword: string
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.passwordHash = hashed;
  await user.save();

  return true;
};