"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetOtp = exports.requestResetOtp = exports.verifyRegisterOtp = exports.requestRegisterOtp = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../user/user.model");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const otp_model_1 = require("./otp.model");
const otp_1 = require("../../utils/otp");
const mail_service_1 = require("../../services/mail.service");
const OTP_EXPIRE_MS = 5 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const createHttpError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
const normalizeEmailOrThrow = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        throw createHttpError("Email is required", 400);
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw createHttpError("Email format is invalid", 400);
    }
    return normalizedEmail;
};
const registerUser = async (name, email, password) => {
    const existing = await user_model_1.User.findOne({ email });
    if (existing) {
        throw new Error("Email already in use");
    }
    const passwordHash = await (0, hash_1.hashPassword)(password);
    const user = await user_model_1.User.create({ name, email, passwordHash });
    const token = (0, jwt_1.generateToken)({ userId: user._id.toString() });
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
    const token = (0, jwt_1.generateToken)({ userId: user._id.toString() });
    return { user, token };
};
exports.loginUser = loginUser;
const requestRegisterOtp = async (email) => {
    const normalizedEmail = normalizeEmailOrThrow(email);
    const existing = await user_model_1.User.findOne({ email: normalizedEmail });
    if (existing) {
        throw createHttpError("Email already in use", 400);
    }
    const code = (0, otp_1.generateOtp)();
    await otp_model_1.Otp.findOneAndUpdate({ email: normalizedEmail, purpose: "register" }, {
        $set: {
            code,
            expiresAt: new Date(Date.now() + OTP_EXPIRE_MS),
        },
    }, {
        upsert: true,
        returnDocument: "after",
    });
    await (0, mail_service_1.sendOtpEmail)(normalizedEmail, code, "register");
    return { message: "OTP sent to email" };
};
exports.requestRegisterOtp = requestRegisterOtp;
const verifyRegisterOtp = async (name, email, password, code) => {
    const normalizedEmail = normalizeEmailOrThrow(email);
    const otpDoc = await otp_model_1.Otp.findOne({
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
    const existing = await user_model_1.User.findOne({ email: normalizedEmail });
    if (existing) {
        throw createHttpError("Email already in use", 400);
    }
    const passwordHash = await (0, hash_1.hashPassword)(password);
    const user = await user_model_1.User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
    });
    await otp_model_1.Otp.deleteOne({ _id: otpDoc._id });
    const token = (0, jwt_1.generateToken)({ userId: user._id.toString() });
    return { user, token };
};
exports.verifyRegisterOtp = verifyRegisterOtp;
const requestResetOtp = async (email) => {
    const normalizedEmail = normalizeEmailOrThrow(email);
    const user = await user_model_1.User.findOne({ email: normalizedEmail });
    if (!user) {
        throw createHttpError("User not found", 404);
    }
    const code = (0, otp_1.generateOtp)();
    await otp_model_1.Otp.findOneAndUpdate({ email: normalizedEmail, purpose: "reset_password" }, {
        $set: {
            code,
            expiresAt: new Date(Date.now() + OTP_EXPIRE_MS),
        },
    }, {
        upsert: true,
        returnDocument: "after",
    });
    await (0, mail_service_1.sendOtpEmail)(normalizedEmail, code, "reset_password");
    return { message: "OTP sent to email" };
};
exports.requestResetOtp = requestResetOtp;
const verifyResetOtp = async (email, code, newPassword) => {
    const normalizedEmail = normalizeEmailOrThrow(email);
    const otpDoc = await otp_model_1.Otp.findOne({
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
    const user = await user_model_1.User.findOne({ email: normalizedEmail });
    if (!user) {
        throw createHttpError("User not found", 404);
    }
    user.passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await user.save();
    await otp_model_1.Otp.deleteOne({ _id: otpDoc._id });
    return { message: "Password updated successfully" };
};
exports.verifyResetOtp = verifyResetOtp;
