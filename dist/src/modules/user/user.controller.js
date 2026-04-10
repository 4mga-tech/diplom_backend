"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = require("./user.model");
const getProfile = async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ name: user.name, email: user.email });
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
        res.json({ name: user.name, email: user.email });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProfile = updateProfile;
