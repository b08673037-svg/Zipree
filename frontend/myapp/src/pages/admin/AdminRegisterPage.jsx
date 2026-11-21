import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import "./AdminRegisterPage.css";

export default function AdminRegisterPage() {
  useDocumentTitle("Create Admin");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/admin-register", { name, email, phone, password, secretCode });
      setSuccess("Admin account created! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create admin account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zipree-admin-register-page">
      <div className="zipree-admin-register-page__bg" />
      <div className="zipree-admin-register-page__overlay" />

      <motion.div 
        className="zipree-admin-register-page__card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="zipree-admin-register__icon">
          <FiUserPlus />
        </div>
        
        <h1 className="zipree-admin-register-page__title">Create Admin</h1>
        <p className="zipree-admin-register-page__subtitle">
          You must have the secret admin code to create a new administrator.
        </p>

        <form className="zipree-admin-register__form" onSubmit={handleSubmit}>
          {error && <div className="zipree-admin-register__error">{error}</div>}
          {success && <div className="zipree-admin-register__success">{success}</div>}

          <div className="zipree-admin-register__field">
            <label>Admin Secret Code</label>
            <input 
              type="password" 
              value={secretCode} 
              onChange={(e) => setSecretCode(e.target.value)} 
              placeholder="Enter the secret code"
              required
            />
          </div>

          <div className="zipree-admin-register__row">
            <div className="zipree-admin-register__field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
            <div className="zipree-admin-register__field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@zipree.com" required />
            </div>
          </div>

          <div className="zipree-admin-register__row">
            <div className="zipree-admin-register__field">
              <label>Phone Number (Optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
            </div>
            <div className="zipree-admin-register__field">
              <label>Password</label>
              <div className="zipree-admin-register__input-wrap">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Strong password required"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="zipree-admin-register__eye"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="zipree-admin-register__actions">
            <button type="submit" className="zipree-btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </div>
        </form>

        <div className="zipree-admin-register-page__footer">
          <Link to="/admin/login">Already an admin? Sign in here</Link>
        </div>
      </motion.div>
    </div>
  );
}