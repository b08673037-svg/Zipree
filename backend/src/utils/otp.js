import crypto from "crypto";

// 1. Generate a 6-digit numeric OTP
export function generateOtp() {
  // crypto.randomInt is cryptographically secure (unlike Math.random)
  return crypto.randomInt(100000, 999999).toString();
}

// 2. Hash the OTP before saving to DB (SHA-256)
export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// 3. Verify the OTP
export function verifyOtp(plainOtp, hashedOtp) {
  const hashedInput = hashOtp(plainOtp);
  return hashedInput === hashedOtp;
}