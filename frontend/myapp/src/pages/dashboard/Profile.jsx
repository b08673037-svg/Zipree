import { useState } from "react";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import "./Profile.css";

export default function Profile() {
  useDocumentTitle("My Profile");
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" }); // Clear messages on change
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || "", phone: user?.phone || "" });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put("/auth/me", formData);
      
      // Update the global AuthContext so the Navbar reflects the new name instantly
      updateUser(res.user);
      
      setMessage({ type: "success", text: "Profile updated successfully." });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="zipree-profile"
    >
      <div className="zipree-dash-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and contact details.</p>
      </div>

      <div className="zipree-profile-card">
        {/* Avatar Header */}
        <div className="zipree-profile-header">
          <div className="zipree-profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        {message.text && (
          <div className={`zipree-profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="zipree-profile-form" onSubmit={handleSubmit}>
          <div className="zipree-profile-form__row">
            <div className="zipree-profile-field">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              />
            </div>
            
            <div className="zipree-profile-field">
              <label>Email Address</label>
              <input 
                type="email" 
                value={user?.email || ""} 
                disabled 
                title="Email cannot be changed"
              />
            </div>
          </div>

          <div className="zipree-profile-form__row">
            <div className="zipree-profile-field">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Add your phone number"
              />
            </div>
            <div className="zipree-profile-field">
              <label>Account Role</label>
              <input 
                type="text" 
                value={user?.role || "customer"} 
                disabled 
                style={{ textTransform: "capitalize" }}
              />
            </div>
          </div>

          <div className="zipree-profile-actions">
            {isEditing ? (
              <>
                <button type="submit" className="zipree-btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="zipree-btn-secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="zipree-btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}