"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
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
    await exports.transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject,
        html,
    });
};
exports.sendOtpEmail = sendOtpEmail;
