"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../user/user.model");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerUser = async (name, email, password) => {
    const existing = await user_model_1.User.findOne({ email });
    if (existing) {
        throw new Error("Email already in use");
    }
    const passwordHash = await (0, hash_1.hashPassword)(password);
    const user = await user_model_1.User.create({
        name,
        email,
        passwordHash,
    });
    const token = (0, jwt_1.generateToken)({ id: user._id });
    return { user, token };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const valid = await (0, hash_1.comparePassword)(password, user.passwordHash);
    if (!valid) {
        throw new Error("Invalid credentials");
    }
    const token = (0, jwt_1.generateToken)({ userId: user._id });
    return { user, token };
    
};
exports.loginUser = loginUser;
const resetPasswordService = async (email, newPassword) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, 10);
    user.passwordHash = hashed;
    await user.save();
    return true;
};
exports.resetPasswordService = resetPasswordService;
