import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/apiClient.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./AuthPages.css";

export default function RegisterPage() {
  useDocumentTitle("Create Account");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // We will connect this to the backend register endpoint
      await api.post("/auth/register", { name, email, phone, password });
      
      // On success, navigate to OTP screen, passing the email
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=email_verification`);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zipree-auth">
      {/* Left Image Side */}
      <div className="zipree-auth__image-side">
        <div className="zipree-auth__image-content">
          <h2 className="zipree-auth__image-title">Begin Your Journey.</h2>
          <p className="zipree-auth__image-text">
            Create an account to reserve exceptional vehicles, save your favorites, and experience the ZIPREE standard.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="zipree-auth__form-side">
        <motion.div 
          className="zipree-auth__form-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="zipree-auth__header">
            <Link to="/" className="zipree-auth__logo">
              <img src="/logo-full.svg" alt="ZIPREE" style={{ height: "40px" }} />
            </Link>
            <h1 className="zipree-auth__title">Create Account</h1>
            <p className="zipree-auth__subtitle">Join the ZIPREE collection today.</p>
          </div>

          <form className="zipree-auth__form" onSubmit={handleSubmit}>
            {error && <div className="zipree-auth__message">{error}</div>}

            <div className="zipree-auth__field">
              <label className="zipree-auth__label">Full Name</label>
              <input 
                type="text" 
                className="zipree-auth__input" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="zipree-auth__field">
              <label className="zipree-auth__label">Email Address</label>
              <input 
                type="email" 
                className="zipree-auth__input" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="zipree-auth__field">
              <label className="zipree-auth__label">Phone (Optional)</label>
              <input 
                type="tel" 
                className="zipree-auth__input" 
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="zipree-auth__field">
              <label className="zipree-auth__label">Password</label>
              <div className="zipree-auth__input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="zipree-auth__input" 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="zipree-auth__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="zipree-auth__checkbox-row">
              <input type="checkbox" className="zipree-auth__checkbox" required />
              <label className="zipree-auth__checkbox-label">
                I agree to the <Link to="/terms" style={{ color: "var(--color-champagne)" }}>Terms</Link> and <Link to="/privacy" style={{ color: "var(--color-champagne)" }}>Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="zipree-auth__submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="zipree-auth__footer">
            Already have an account? <Link to="/login" className="zipree-auth__link">Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}