import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../lib/format.js";

export default function FleetCard({ car, index }) {
  // Editorial Layout: First card is large, others are smaller
  const isLarge = index === 0;

  return (
    <motion.div
      className={`zipree-fleet-card ${isLarge ? "zipree-fleet-card--large" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/fleet/${car._id}`} className="zipree-fleet-card__link">
        {/* Image Area */}
        <div className="zipree-fleet-card__image-wrap">
          <div className="zipree-fleet-card__badge">{car.category}</div>
          <div className="zipree-fleet-card__rating">★ {car.ratingAverage || "5.0"}</div>
          <img 
            src={car.images[0]} 
            alt={`${car.brand} ${car.model}`} 
            className="zipree-fleet-card__image"
            loading="lazy"
          />
        </div>

        {/* Content Area */}
        <div className="zipree-fleet-card__content">
          <div className="zipree-fleet-card__header">
            <p className="zipree-fleet-card__brand">{car.brand}</p>
            <h3 className="zipree-fleet-card__title">{car.model}</h3>
          </div>

          <div className="zipree-fleet-card__specs">
            <span>{car.year}</span>
            <span className="dot">•</span>
            <span>{car.transmission}</span>
            <span className="dot">•</span>
            <span>{car.seating} Seats</span>
          </div>

          <div className="zipree-fleet-card__footer">
            <p className="zipree-fleet-card__price">
              {formatCurrency(car.dailyPrice)} <span>/ day</span>
            </p>
            <div className="zipree-fleet-card__cta">
              View Details ↗
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}