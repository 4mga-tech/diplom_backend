// user.controller.ts
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { User } from "./user.model";

const PROFILE_IMAGE_FIELD = "avatar";

const toProfileResponse = (user: {
  name: string;
  email: string;
  avatarUrl?: string | null;
}) => ({
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(toProfileResponse(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    await user.save();

    res.json(toProfileResponse(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({
        message: `Avatar image is required in the '${PROFILE_IMAGE_FIELD}' field`,
      });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      avatarUrl: user.avatarUrl,
      profile: toProfileResponse(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
