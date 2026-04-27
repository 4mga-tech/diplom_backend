import nodemailer from "nodemailer";
import { env } from "../config/env";

const isProduction = process.env.NODE_ENV === "production";

const createHttpError = (message: string, statusCode = 500) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (
  email: string,
  code: string,
  purpose: "register" | "reset_password",
) => {
  const subject =
    purpose === "register"
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
    await transporter.sendMail({
      from: env.MAIL_USER,
      to: email,
      subject,
      html,
    });

    if (!isProduction) {
      console.log(`OTP email accepted for: ${email}`);
    }
  } catch (error: any) {
    console.error("Failed to send OTP email", {
      recipient: email,
      purpose,
      error: error?.message ?? "Unknown mailer error",
    });

    throw createHttpError(
      "Failed to send OTP email. Please check the email address and try again.",
      502,
    );
  }
};
