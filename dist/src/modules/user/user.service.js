"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const user_model_1 = require("./user.model");
const getUserProfile = async (userId) => {
    const user = await user_model_1.User.findById(userId).select("-passwordHash");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const user = await user_model_1.User.findByIdAndUpdate(userId, data, { returnDocument: "after" }).select("-passwordHash");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.updateUserProfile = updateUserProfile;
