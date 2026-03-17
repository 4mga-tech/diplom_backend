import { User } from "../user/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

export const registerUser = async (
  email: string,
  password: string
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash,
  });

  const token = generateToken({ id: user._id });

  return { user, token };
};

export const loginUser = async (
  email: string,
  password: string
) => {
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