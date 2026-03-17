import { User } from "./user.model";

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: {
    nativeLanguage?: string;
    uiLanguage?: string;
  }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};