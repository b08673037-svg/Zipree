import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/apiClient.js";
import useAuth from "../hooks/useAuth.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./AuthPages.css";

export default function LoginPage() {
  useDocumentTitle("Sign In");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The AuthContext handles saving the token and user state
      await login(email, password);
      navigate("/fleet"); // Redirect to Fleet on success
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zipree-auth">
      {/* Left Image Side */}
      <div className="zipree-auth__image-side">
        <div className="zipree-auth__image-content">
          <h2 className="zipree-auth__image-title">Return to the Extraordinary.</h2>
          <p className="zipree-auth__image-text">
            Sign in to manage your reservations, access your wishlist, and continue your journey with ZIPREE.
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
              {/* Assuming you have a Logo component, or just text */}
              <img src="/logo-full.svg" alt="ZIPREE" style={{ height: "40px" }} />
            </Link>
            <h1 className="zipree-auth__title">Welcome Back</h1>
            <p className="zipree-auth__subtitle">Enter your details to access your account.</p>
          </div>

          <form className="zipree-auth__form" onSubmit={handleSubmit}>
            {error && <div className="zipree-auth__message">{error}</div>}

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
              <label className="zipree-auth__label">Password</label>
              <div className="zipree-auth__input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="zipree-auth__input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="zipree-auth__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="zipree-auth__checkbox-row" style={{ justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" className="zipree-auth__checkbox" />
                <span className="zipree-auth__checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" style={{ fontSize: "13px", color: "var(--color-champagne)", textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="zipree-auth__submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="zipree-auth__footer">
            Don't have an account? <Link to="/register" className="zipree-auth__link">Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}