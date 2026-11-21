import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatCurrency } from "../../lib/format.js";
import "./SavedVehicles.css";

export default function SavedVehicles() {
  useDocumentTitle("Saved Vehicles");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await api.get("/wishlist");
        setItems(res.items);
      } catch (err) {
        console.error("Failed to load wishlist", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  const handleRemove = async (carId) => {
    try {
      await api.del(`/wishlist/${carId}`);
      setItems(items.filter(item => item.car._id !== carId));
    } catch (err) {
      alert("Failed to remove vehicle. Please try again.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="zipree-dash-header">
        <h1>Saved Vehicles</h1>
        <p>Your curated collection of exceptional drives.</p>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-silver)" }}>Loading saved vehicles...</p>
      ) : items.length === 0 ? (
        <div className="zipree-dash-empty">
          <h3>Your wishlist is empty</h3>
          <p>Explore our fleet and save the vehicles that inspire you.</p>
          <Link to="/fleet" className="zipree-dash-btn">Explore the Fleet</Link>
        </div>
      ) : (
        <div className="zipree-saved-grid">
          {items.map((item) => (
            <div key={item.car._id} className="zipree-saved-card">
              <Link to={`/fleet/${item.car._id}`} className="zipree-saved-card__image-wrap">
                <img 
                  src={item.car.images[0]} 
                  alt={item.car.model} 
                  className="zipree-saved-card__image" 
                />
              </Link>
              
              <div className="zipree-saved-card__content">
                <div className="zipree-saved-card__header">
                  <div>
                    <span className="zipree-saved-card__brand">{item.car.brand}</span>
                    <h3 className="zipree-saved-card__title">{item.car.model}</h3>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.car._id)}
                    className="zipree-saved-card__remove"
                    aria-label="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="zipree-saved-card__footer">
                  <p className="zipree-saved-card__price">
                    {formatCurrency(item.car.dailyPrice)} <span>/ day</span>
                  </p>
                  <Link to={`/fleet/${item.car._id}`} className="zipree-saved-card__link">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}