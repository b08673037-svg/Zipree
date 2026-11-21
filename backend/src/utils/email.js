import nodemailer from "nodemailer";
import config from "../config/index.js";

// Create the transporter using Ethereal (or your real SMTP)
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

export async function sendOtpEmail(email, otp, type) {
  let subject = "";
  let title = "";
  let message = "";

  if (type === "email_verification") {
    subject = "Verify your ZIPREE account";
    title = "Welcome to ZIPREE";
    message = "Please use the verification code below to activate your account.";
  } else if (type === "login") {
    subject = "Your ZIPREE Login Code";
    title = "Secure Login";
    message = "Use the code below to securely sign into your ZIPREE account.";
  } else if (type === "password_reset") {
    subject = "Reset your ZIPREE password";
    title = "Password Reset";
    message = "Use the code below to reset your password. If you did not request this, please ignore this email.";
  }

  // Beautiful HTML Email Template
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #111315; color: #F5F3EF; padding: 40px 20px; text-align: center;">
      <h1 style="color: #C6A46A; font-size: 24px; letter-spacing: 2px; margin-bottom: 20px;">ZIPREE</h1>
      <div style="background-color: #25282A; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(198,164,106,0.2);">
        <h2 style="font-size: 20px; margin-bottom: 10px;">${title}</h2>
        <p style="color: #A7ADB2; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">${message}</p>
        
        <div style="background-color: #111315; padding: 15px; border-radius: 4px; border: 1px dashed #C6A46A; margin-bottom: 30px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #F5F3EF;">${otp}</span>
        </div>
        
        <p style="color: #A7ADB2; font-size: 12px;">This code expires in 5 minutes.</p>
      </div>
      <p style="color: #A7ADB2; font-size: 12px; margin-top: 20px;">© ${new Date().getFullYear()} ZIPREE. All rights reserved.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.emailFrom,
      to: email,
      subject,
      html,
    });

    // Log the preview URL so you can click it to see the email in development
    console.log(`\n[email] OTP sent to ${email}`);
    console.log(`[email] Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);
    
    return true;
  } catch (err) {
    console.error("[email] Failed to send OTP email:", err.message);
    return false;
  }
}