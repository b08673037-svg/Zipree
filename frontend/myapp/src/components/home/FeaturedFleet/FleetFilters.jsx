import { motion } from "framer-motion";

export default function FleetFilters({ categories, active, onChange }) {
  return (
    <div className="zipree-fleet-filters">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`zipree-fleet-filters__btn ${active === cat ? "is-active" : ""}`}
        >
          {cat === "all" ? "All Vehicles" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          {active === cat && (
            <motion.div layoutId="activeFilter" className="zipree-fleet-filters__indicator" />
          )}
        </button>
      ))}
    </div>
  );
}