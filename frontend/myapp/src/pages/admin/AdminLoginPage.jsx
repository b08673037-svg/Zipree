import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import "./AdminLoginPage.css";

export default function AdminLoginPage() {
  useDocumentTitle("Admin Access");
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await adminLogin(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zipree-admin-login">
      <div className="zipree-admin-login__bg" />
      <div className="zipree-admin-login__overlay" />

      <motion.div 
        className="zipree-admin-login__card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="zipree-admin-login__icon">
          <FiLock />
        </div>
        
        <h1 className="zipree-admin-login__title">Admin Access</h1>
        <p className="zipree-admin-login__subtitle">
          Restricted area. Authorized personnel only.
        </p>

        <form className="zipree-admin-login__form" onSubmit={handleSubmit}>
          {error && <div className="zipree-admin-login__error">{error}</div>}

          <div className="zipree-admin-login__field">
            <label>Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@zipree.com"
              required
            />
          </div>

          <div className="zipree-admin-login__field">
            <label>Password</label>
            <div className="zipree-admin-login__input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="zipree-admin-login__eye"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="zipree-admin-login__btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="zipree-admin-login__footer">
          <p>
            Need an admin account? <Link to="/admin/register">Sign up here</Link>
          </p>
          <p style={{ marginTop: "8px", fontSize: "12px" }}>
            <Link to="/login">Return to Customer Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}