import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./HeroSection.css";

const locations = ["Lahore", "Karachi", "Islamabad"];

export default function HeroSection() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const [location, setLocation] = useState("Lahore");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = () => {
    // Build the query parameters for the fleet page
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (pickupDate) params.append("pickup", pickupDate);
    if (returnDate) params.append("return", returnDate);
    
    navigate(`/fleet?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="zipree-hero">

      {/* Background Image */}
      <div className="zipree-hero__bg">
        <img
          src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2560&auto=format&fit=crop"
          alt="Luxury car"
          className="zipree-hero__bg-image"
        />

        <div className="zipree-hero__bg-overlay" />
      </div>

      {/* Hero Content */}
      <div className="zipree-hero__content">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="zipree-hero__content-inner"
        >
          <motion.p
            variants={itemVariants}
            className="zipree-hero__eyebrow"
          >
            Drive Beyond Ordinary
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="zipree-hero__title"
          >
            The Ultimate <br />
            <span className="zipree-hero__title-gold">
              Driving Experience.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="zipree-hero__desc"
          >
            Zipree offers premium automotive rentals tailored for modern
            drivers. Whether you need a daily rental or a flexible monthly
            plan, we deliver quality vehicles, transparent pricing, and a
            seamless booking experience.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="zipree-hero__actions"
          >
            <Link to="/fleet" className="zipree-hero__btn-primary">
              Browse Our Fleet
            </Link>

            <Link to="/about" className="zipree-hero__btn-secondary">
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Booking Search Panel */}
      <motion.div
        className="zipree-hero__search"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          duration: reduce ? 0 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="zipree-hero__search-inner">

          {/* Pickup Location */}
          <div
            className="zipree-hero__search-field zipree-hero__location-field"
            ref={dropdownRef}
          >
            <label>Pickup Location</label>

            <button
              type="button"
              className={`zipree-hero__location-trigger ${
                dropdownOpen ? "is-open" : ""
              }`}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              <span>{location}</span>

              <svg
                className="zipree-hero__location-chevron"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {dropdownOpen && (
              <motion.div
                className="zipree-hero__location-dropdown"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                role="listbox"
              >
                <div className="zipree-hero__dropdown-heading">
                  SELECT YOUR CITY
                </div>

                {locations.map((city) => (
                  <button
                    type="button"
                    key={city}
                    role="option"
                    aria-selected={location === city}
                    className={`zipree-hero__location-option ${
                      location === city ? "is-selected" : ""
                    }`}
                    onClick={() => {
                      setLocation(city);
                      setDropdownOpen(false);
                    }}
                  >
                    <span>{city}</span>

                    {location === city && (
                      <span className="zipree-hero__option-check">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="zipree-hero__search-divider" />

          {/* Pickup Date and Time */}
          <div className="zipree-hero__search-field">
            <label>Pickup Date & Time</label>

            <div className="zipree-hero__date-time">
              <input
                type="date"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
                aria-label="Pickup date"
              />

              <input
                type="time"
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
                aria-label="Pickup time"
              />
            </div>
          </div>

          <div className="zipree-hero__search-divider" />

          {/* Return Date and Time */}
          <div className="zipree-hero__search-field">
            <label>Return Date & Time</label>

            <div className="zipree-hero__date-time">
              <input
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                aria-label="Return date"
                min={pickupDate || undefined}
              />

              <input
                type="time"
                value={returnTime}
                onChange={(event) => setReturnTime(event.target.value)}
                aria-label="Return time"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="zipree-hero__search-btn"
          >
            Search Fleet
            <span>↗</span>
          </button>

        </div>
      </motion.div>

    </section>
  );
}