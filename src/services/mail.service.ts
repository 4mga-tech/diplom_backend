import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
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

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject,
    html,
  });
};