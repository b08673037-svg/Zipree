import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email_verification", "login", "password_reset"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
      // This creates a TTL index in MongoDB. 
      // The document will automatically be deleted by MongoDB after 5 minutes.
      expires: 300, 
    },
  },
  { timestamps: true }
);

// Ensure fast lookups by email and type
otpSchema.index({ email: 1, type: 1 });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;