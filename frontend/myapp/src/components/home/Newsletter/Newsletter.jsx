import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../../lib/apiClient.js";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import "./Newsletter.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [message, setMessage] = useState("");
  const reduce = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus("idle");

    try {
      const res = await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setMessage(res.message || "Successfully joined the ZIPREE journal.");
      setEmail(""); // Clear input on success
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="zipree-newsletter">
      <div className="zipree-newsletter__bg-image" />
      <div className="zipree-newsletter__overlay" />

      <div className="zipree-newsletter__container">
        
        {/* Left Side: Text */}
        <motion.div 
          className="zipree-newsletter__content"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="zipree-newsletter__eyebrow">The ZIPREE Journal</p>
          <h2 className="zipree-newsletter__title">
            A More Refined Way<br />
            to <span className="zipree-newsletter__title-gold">Stay in the Know.</span>
          </h2>
          <p className="zipree-newsletter__desc">
            Discover exceptional drives, explore our latest arrivals, and receive carefully curated updates from the world of ZIPREE.
          </p>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          className="zipree-newsletter__form-wrapper"
          initial={reduce ? false : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {status === "success" ? (
            <motion.div 
              className="zipree-newsletter__success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="zipree-newsletter__success-icon">✓</div>
              <p className="zipree-newsletter__success-text">{message}</p>
            </motion.div>
          ) : (
            <form className="zipree-newsletter__form" onSubmit={handleSubmit}>
              <div className="zipree-newsletter__input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="zipree-newsletter__input"
                  required
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="zipree-newsletter__btn"
                  disabled={loading}
                >
                  {loading ? "..." : "→"}
                </button>
              </div>
              {status === "error" && (
                <p className="zipree-newsletter__error">{message}</p>
              )}
              <p className="zipree-newsletter__note">
                Thoughtful updates only. Unsubscribe whenever you wish.
              </p>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
}