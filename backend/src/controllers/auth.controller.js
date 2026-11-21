import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import {
  runValidators,
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
} from "../utils/validators.js";
import config from "../config/index.js";

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body || {};

    const error = runValidators(
      { name, email, password, phone },
      {
        name: validateName,
        email: validateEmail,
        password: validatePassword,
        phone: validatePhone,
      }
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : "",
    });

    const plainOtp = generateOtp();
    const hashedOtp = hashOtp(plainOtp);

    await Otp.deleteMany({ email: normalizedEmail, type: "email_verification" });
    await Otp.create({
      email: normalizedEmail,
      otpHash: hashedOtp,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(normalizedEmail, plainOtp, "email_verification");

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email for the verification code.",
      email: normalizedEmail,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "An account with this email already exists." });
    }
    next(err);
  }
}

// POST /api/auth/verify-email-otp
export async function verifyEmailOtp(req, res, next) {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({ email: normalizedEmail, type: "email_verification" });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new code." });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ success: false, message: "Verification code has expired." });
    }

    const isValid = verifyOtp(otp, otpRecord.otpHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Incorrect verification code." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    user.isVerified = true;
    await user.save();

    await otpRecord.deleteOne();

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/resend-otp
export async function resendOtp(req, res, next) {
  try {
    const { email, type } = req.body || {};

    if (!email || !type) {
      return res.status(400).json({ success: false, message: "Email and type are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const plainOtp = generateOtp();
    const hashedOtp = hashOtp(plainOtp);

    await Otp.deleteMany({ email: normalizedEmail, type });
    await Otp.create({
      email: normalizedEmail,
      otpHash: hashedOtp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(normalizedEmail, plainOtp, type);

    return res.status(200).json({ success: true, message: "A new verification code has been sent." });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ success: false, message: "Account is suspended." });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "Logged in.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/admin-login
export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Administrator privileges required." });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({ success: false, message: "Account is suspended." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "Admin logged in.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/admin-register (Public with Secret)
export async function adminRegister(req, res, next) {
  try {
    const { name, email, password, phone, secretCode } = req.body || {};

    if (secretCode !== config.adminSecret) {
      return res.status(403).json({ success: false, message: "Access denied. Invalid admin registration code." });
    }

    const error = runValidators(
      { name, email, password, phone },
      {
        name: validateName,
        email: validateEmail,
        password: validatePassword,
        phone: validatePhone,
      }
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : "",
      role: "admin",
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully. You can now log in.",
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "An account with this email already exists." });
    }
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res) {
  return res.status(200).json({ success: true, user: req.user.toJSON() });
}

// PUT /api/auth/me
export async function updateProfile(req, res, next) {
  try {
    const { name, phone, profileImage } = req.body || {};

    const error = runValidators(
      { name, phone },
      {
        name: validateName,
        phone: validatePhone,
      }
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}