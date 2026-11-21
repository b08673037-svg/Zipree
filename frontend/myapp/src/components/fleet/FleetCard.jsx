import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/format.js";

export default function FleetCard({ car }) {
  return (
    <Link to={`/fleet/${car._id}`} className="zipree-fleet-card" style={{ textDecoration: "none" }}>
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "1.45 / 1" }}>
        <img 
          src={car.images[0]} 
          alt={`${car.brand} ${car.model}`} 
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
          loading="lazy"
        />
        <div style={{ 
          position: "absolute", top: 12, left: 12, 
          background: "rgba(17,19,21,0.7)", padding: "4px 10px", 
          borderRadius: "2px", fontSize: "10px", color: "var(--color-champagne)",
          textTransform: "uppercase", letterSpacing: "0.1em", backdropFilter: "blur(4px)"
        }}>
          {car.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ fontSize: "11px", color: "var(--color-champagne)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
          {car.brand}
        </p>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--color-ivory)", marginBottom: "12px" }}>
          {car.model}
        </h3>
        
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--color-silver)", marginBottom: "22px" }}>
          <span>{car.year}</span>
          <span>•</span>
          <span style={{ textTransform: "capitalize" }}>{car.transmission}</span>
          <span>•</span>
          <span>{car.seating} Seats</span>
        </div>

        <div style={{ 
          marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center" 
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--color-ivory)", fontWeight: 600 }}>
            {formatCurrency(car.dailyPrice)} <span style={{ fontSize: "12px", color: "var(--color-silver)", fontWeight: 400 }}>/ day</span>
          </p>
          <span style={{ fontSize: "11px", color: "var(--color-champagne)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            View Details ↗
          </span>
        </div>
      </div>
    </Link>
  );
}