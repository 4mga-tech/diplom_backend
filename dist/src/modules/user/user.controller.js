"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvatar = exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = require("./user.model");
const PROFILE_IMAGE_FIELD = "avatar";
const toProfileResponse = (user) => ({
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
});
const getProfile = async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(toProfileResponse(user));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!req.userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (name)
            user.name = name;
        await user.save();
        res.json(toProfileResponse(user));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProfile = updateProfile;
const updateAvatar = async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!req.file) {
            return res.status(400).json({
                message: `Avatar image is required in the '${PROFILE_IMAGE_FIELD}' field`,
            });
        }
        const user = await user_model_1.User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await user.save();
        res.json({
            message: "Avatar updated successfully",
            avatarUrl: user.avatarUrl,
            profile: toProfileResponse(user),
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateAvatar = updateAvatar;
