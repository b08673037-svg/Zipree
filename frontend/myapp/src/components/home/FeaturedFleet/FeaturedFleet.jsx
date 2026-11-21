import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getFeaturedCars } from "../../../lib/fleetApi.js";
import FleetCard from "./FleetCard.jsx";
import FleetFilters from "./FleetFilters.jsx";
import "./FeaturedFleet.css";

const CATEGORIES = ["all", "luxury", "sports", "suv", "sedan", "electric"];

export default function FeaturedFleet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCars() {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeaturedCars(activeCategory);
        if (isMounted) setCars(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load fleet.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCars();
    return () => { isMounted = false; };
  }, [activeCategory]);

  return (
    <section className="zipree-fleet">
      <div className="zipree-fleet__header">
        <p className="zipree-fleet__eyebrow">The ZIPREE Collection</p>
        <h2 className="zipree-fleet__title">
          Exceptional Machines.<br />
          <span className="zipree-fleet__title-gold">Extraordinary Journeys.</span>
        </h2>
        <p className="zipree-fleet__desc">
          Explore a handpicked collection of exceptional vehicles, selected to make every journey unforgettable.
        </p>
      </div>

      <FleetFilters 
        categories={CATEGORIES} 
        active={activeCategory} 
        onChange={setActiveCategory} 
      />

      <div className="zipree-fleet__grid-wrapper">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="zipree-fleet__grid" exit={{ opacity: 0 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="zipree-fleet__skeleton" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="zipree-fleet__error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>{error}</p>
              <button onClick={() => setActiveCategory("all")}>Try Again</button>
            </motion.div>
          ) : cars.length === 0 ? (
            <motion.div key="empty" className="zipree-fleet__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>Your next extraordinary drive is waiting.</h3>
              <p>No vehicles found in this category right now.</p>
            </motion.div>
          ) : (
            <motion.div 
              key={activeCategory} 
              className="zipree-fleet__grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {cars.map((car, index) => (
                <FleetCard key={car._id} car={car} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="zipree-fleet__footer">
        <Link to="/fleet" className="zipree-fleet__view-all">
          View All Fleet <span>↗</span>
        </Link>
      </div>
    </section>
  );
}