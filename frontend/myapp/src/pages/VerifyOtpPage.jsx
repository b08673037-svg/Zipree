import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, setToken } from "../lib/apiClient.js";
import useAuth from "../hooks/useAuth.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./VerifyOtpPage.css";

export default function VerifyOtpPage() {
  useDocumentTitle("Verify Identity");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // To get user context if needed
  
  const email = searchParams.get("email");
  const type = searchParams.get("type") || "email_verification";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Countdown timer for Resend
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for the 6 input boxes
  const inputRefs = useRef([]);

  // Handle the countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle typing in the OTP boxes
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-advance to next box if a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move back to previous box if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Pasting the 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the last filled box
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  // Submit the OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-email-otp", {
        email,
        otp: otpString,
      });

      // Save token and trigger success
      setToken(res.token);
      setSuccess(true);
      
      // Reload to update AuthContext, then redirect
      setTimeout(() => {
        window.location.href = "/fleet"; 
      }, 2000);

    } catch (err) {
      setError(err.message || "Invalid or expired code.");
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setError("");

    try {
      await api.post("/auth/resend-otp", { email, type });
    } catch (err) {
      setError("Failed to resend code. Please try again later.");
    }
  };

  if (!email) {
    return (
      <main className="zipree-auth">
        <div className="zipree-auth__form-side">
          <div className="zipree-auth__form-wrapper" style={{ textAlign: "center" }}>
            <h2>Missing Email</h2>
            <p style={{ color: "var(--color-silver)", marginTop: "16px", marginBottom: "32px" }}>
              We could not find an email address to verify.
            </p>
            <Link to="/register" className="zipree-auth__submit">Return to Registration</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="zipree-auth">
      {/* Left side image (same as Login/Register) */}
      <div className="zipree-auth__image-side">
        <div className="zipree-auth__image-content">
          <h2 className="zipree-auth__image-title">Secure Your Journey.</h2>
          <p className="zipree-auth__image-text">
            We are verifying your identity to ensure the highest level of security for your ZIPREE account.
          </p>
        </div>
      </div>

      {/* Right side OTP form */}
      <div className="zipree-auth__form-side">
        <motion.div 
          className="zipree-auth__form-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="zipree-otp-success"
            >
              <div className="zipree-otp-success__icon">✓</div>
              <h2 className="zipree-otp-success__title">Verified Successfully</h2>
              <p className="zipree-otp-success__text">Redirecting you to the fleet...</p>
            </motion.div>
          ) : (
            <>
              <div className="zipree-auth__header">
                <h1 className="zipree-auth__title">Verify Your Identity</h1>
                <p className="zipree-auth__subtitle">
                  We sent a 6-digit code to <strong style={{ color: "var(--color-ivory)" }}>{email}</strong>
                </p>
              </div>

              <form className="zipree-auth__form" onSubmit={handleSubmit}>
                {error && <div className="zipree-auth__message">{error}</div>}

                <div className="zipree-otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="zipree-otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button type="submit" className="zipree-auth__submit" disabled={loading || otp.join("").length !== 6}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <div className="zipree-otp-actions">
                <p className="zipree-otp-timer">
                  {canResend ? "Didn't receive the code?" : `Resend code in ${countdown}s`}
                </p>
                <button 
                  type="button" 
                  onClick={handleResend} 
                  disabled={!canResend}
                  className={`zipree-otp-resend ${!canResend ? "is-disabled" : ""}`}
                >
                  Resend Code
                </button>
              </div>

              <div className="zipree-auth__footer" style={{ marginTop: "24px" }}>
                Wrong email? <Link to="/register" className="zipree-auth__link">Go back</Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}