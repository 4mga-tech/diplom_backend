"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const isProduction = process.env.NODE_ENV === "production";
const createHttpError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: env_1.env.MAIL_USER,
        pass: env_1.env.MAIL_APP_PASSWORD,
    },
});
const sendOtpEmail = async (email, code, purpose) => {
    const subject = purpose === "register"
        ? "Your registration OTP"
        : "Your password reset OTP";
    const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Your OTP Code</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 4px;">${code}</h1>
      <p>This code expires in 5 minutes.</p>
    </div>
  `;
    console.log(`sending OTP to: ${email}`);
    try {
        await exports.transporter.sendMail({
            from: env_1.env.MAIL_USER,
            to: email,
            subject,
            html,
        });
        if (!isProduction) {
            console.log(`OTP email accepted for: ${email}`);
        }
    }
    catch (error) {
        console.error("Failed to send OTP email", {
            recipient: email,
            purpose,
            error: error?.message ?? "Unknown mailer error",
        });
        throw createHttpError("Failed to send OTP email. Please check the email address and try again.", 502);
    }
};
exports.sendOtpEmail = sendOtpEmail;
