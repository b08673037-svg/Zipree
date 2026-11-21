import { useEffect, useId, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getCarById } from "../lib/fleetApi.js";
import { api, getToken } from "../lib/apiClient.js";
import { formatCurrency } from "../lib/format.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./VehicleDetailPage.css";

const PICKUP_LOCATIONS = [
  { label: "Lahore", value: "Lahore" },
  { label: "Karachi", value: "Karachi" },
  { label: "Islamabad", value: "Islamabad" },
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateRentalDays = (pickup, returnDate) => {
  if (!pickup || !returnDate) return 0;
  const start = new Date(`${pickup}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
};

/* =========================================
   REUSABLE ZIPREE CUSTOM DROPDOWN
========================================= */
function VehicleDropdown({ value, onChange, options, placeholder = "Select an option", className = "" }) {
  const dropdownRef = useRef(null);
  const dropdownId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value) || null;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const openDropdown = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) { openDropdown(); return; }
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) { openDropdown(); return; }
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Home" && isOpen) { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End" && isOpen) { event.preventDefault(); setActiveIndex(options.length - 1); }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) openDropdown();
      else if (options[activeIndex]) selectOption(options[activeIndex]);
    }
    if (event.key === "Escape" && isOpen) { event.preventDefault(); setIsOpen(false); }
  };

  return (
    <div ref={dropdownRef} className={`zipree-vdp-dropdown ${className} ${isOpen ? "is-open" : ""}`}>
      <button type="button" className={`zipree-vdp-dropdown__trigger ${isOpen ? "is-open" : ""}`} onClick={() => (isOpen ? setIsOpen(false) : openDropdown())} onKeyDown={handleKeyDown} aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={`${dropdownId}-listbox`} aria-activedescendant={isOpen ? `${dropdownId}-option-${activeIndex}` : undefined}>
        <span className="zipree-vdp-dropdown__value">{selectedOption?.label || placeholder}</span>
        <motion.span className="zipree-vdp-dropdown__arrow" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22, ease: "easeInOut" }}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div id={`${dropdownId}-listbox`} className="zipree-vdp-dropdown__menu" role="listbox" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <div className="zipree-vdp-dropdown__options">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <button key={option.value} id={`${dropdownId}-option-${index}`} type="button" role="option" aria-selected={isSelected} className={`zipree-vdp-dropdown__option ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOption(option)}>
                    <span>{option.label}</span>
                    {isSelected && (<svg className="zipree-vdp-dropdown__check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 10.5L8 14L15.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================
   SMALL ICON COMPONENT
========================================= */
function DetailIcon({ type }) {
  const paths = {
    transmission: (<><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="1.5" /><circle cx="16" cy="12" r="1.5" /><circle cx="8" cy="18" r="1.5" /></>),
    fuel: (<><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M4 21h12M8 7h4M16 10h2l2 2v6a2 2 0 0 1-4 0v-5" /></>),
    seats: (<><path d="M7 11V5a2 2 0 0 1 4 0v6M5 21v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4" /><path d="M3 21h18" /></>),
    category: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
    calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>),
    location: (<><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type] || paths.category}
    </svg>
  );
}

/* =========================================
   VEHICLE DETAIL PAGE
========================================= */
export default function VehicleDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const images = Array.isArray(car?.images) ? car.images.filter(Boolean) : [];
  const features = Array.isArray(car?.features) ? car.features.filter(Boolean) : [];

  const rentalDays = calculateRentalDays(pickupDate, returnDate);
  const dailyPrice = Number(car?.dailyPrice) || 0;
  const estimatedTotal = rentalDays * dailyPrice;

  useDocumentTitle(car ? `${car.brand} ${car.model}` : "Vehicle Details");

  useEffect(() => {
    let isMounted = true;
    async function fetchCar() {
      setLoading(true);
      setError(null);
      setCar(null);
      try {
        const data = await getCarById(id);
        if (isMounted) {
          setCar(data);
          setActiveImage(0);
        }
      } catch (err) {
        if (isMounted) setError("Vehicle not found or failed to load.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCar();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight") setActiveImage((current) => images.length ? (current + 1) % images.length : 0);
      if (event.key === "ArrowLeft") setActiveImage((current) => images.length ? (current - 1 + images.length) % images.length : 0);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, images.length]);

  const changeImage = (direction) => {
    if (!images.length) return;
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  const handlePickupDate = (value) => {
    setPickupDate(value);
    if (returnDate && value >= returnDate) setReturnDate("");
    setBookingMessage("");
  };

  // THIS IS THE UPDATED RESERVE FUNCTION
  const handleReserve = async () => {
    if (!pickupLocation || !pickupDate || !returnDate) {
      setBookingMessage("Please select your pickup location and rental dates.");
      return;
    }
    if (rentalDays < 1) {
      setBookingMessage("Your return date must be at least one day after pickup.");
      return;
    }

    if (!getToken()) {
      setBookingMessage("Please log in to reserve this vehicle.");
      return;
    }

    setBookingMessage("Reserving your vehicle...");

    try {
      const res = await api.post("/bookings", {
        carId: car._id,
        pickupLocation,
        returnLocation: pickupLocation,
        pickupDateTime: `${pickupDate}T10:00:00Z`,
        returnDateTime: `${returnDate}T10:00:00Z`,
      });
      setBookingMessage(`Success! Booking Reference: ${res.booking.bookingReference}`);
    } catch (err) {
      setBookingMessage(err.message || "Failed to create reservation.");
    }
  };

  if (loading) {
    return (
      <main className="zipree-vdp zipree-vdp--state">
        <div className="zipree-vdp__loader-container">
          <div className="zipree-vdp__spinner" />
          <p>Preparing your vehicle...</p>
        </div>
      </main>
    );
  }

  if (error || !car) {
    return (
      <main className="zipree-vdp zipree-vdp--state">
        <div className="zipree-vdp__error-container">
          <span className="zipree-vdp__state-eyebrow">ZIPREE COLLECTION</span>
          <h1>Vehicle Not Found</h1>
          <p>{error || "The vehicle you are looking for does not exist."}</p>
          <Link to="/fleet" className="zipree-vdp__back-btn">Return to Fleet</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="zipree-vdp">
      <nav className="zipree-vdp__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        <Link to="/fleet">Fleet</Link><span>/</span>
        <span aria-current="page">{car.brand} {car.model}</span>
      </nav>

      <motion.section className="zipree-vdp__gallery-section" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} aria-label="Vehicle image gallery">
        <div className="zipree-vdp__gallery">
          <button type="button" className="zipree-vdp__gallery-main" onClick={() => images.length && setIsLightboxOpen(true)} aria-label="Open main vehicle image" disabled={!images.length}>
            {images[activeImage] ? (<img src={images[activeImage]} alt={`${car.brand} ${car.model}`} fetchPriority="high" />) : (<div className="zipree-vdp__image-fallback">Vehicle image unavailable</div>)}
            <span className="zipree-vdp__gallery-view"><span>↗</span> View Gallery</span>
            {images.length > 0 && (<span className="zipree-vdp__image-count">{activeImage + 1} / {images.length}</span>)}
          </button>
          <div className="zipree-vdp__gallery-side">
            {images.slice(0, 4).map((image, index) => (
              <button key={`${image}-${index}`} type="button" className={`zipree-vdp__gallery-thumb ${activeImage === index ? "is-active" : ""}`} onClick={() => setActiveImage(index)} aria-label={`View vehicle image ${index + 1}`} aria-pressed={activeImage === index}>
                <img src={image} alt={`${car.brand} ${car.model} view ${index + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <div className="zipree-vdp__mobile-thumbnails">
            {images.map((image, index) => (
              <button key={`${image}-mobile-${index}`} type="button" className={`zipree-vdp__mobile-thumb ${activeImage === index ? "is-active" : ""}`} onClick={() => setActiveImage(index)} aria-label={`Select image ${index + 1}`}>
                <img src={image} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </motion.section>

      <div className="zipree-vdp__top-layout">
        <div className="zipree-vdp__left-col">
          <section className="zipree-vdp__intro">
            <div className="zipree-vdp__intro-top">
              <div>
                <p className="zipree-vdp__brand">{car.brand}</p>
                <h1 className="zipree-vdp__title">{car.model}</h1>
              </div>
              <span className="zipree-vdp__category-tag">{car.category}</span>
            </div>
            <div className="zipree-vdp__quick-specs">
              {car.year && <span>{car.year}</span>}
              {car.year && car.seating && <span className="dot">•</span>}
              {car.seating && <span>{car.seating} Seats</span>}
              {(car.year || car.seating) && (<span className="dot">•</span>)}
              <span>Premium Collection</span>
            </div>
          </section>

          <section className="zipree-vdp__details">
            <div className="zipree-vdp__section-heading">
              <span className="zipree-vdp__section-index">01</span>
              <div>
                <p className="zipree-vdp__section-kicker">DISCOVER THE VEHICLE</p>
                <h2 className="zipree-vdp__section-title">The Experience</h2>
              </div>
            </div>
            <p className="zipree-vdp__description">{car.description || "Discover a refined driving experience with this vehicle from the ZIPREE collection."}</p>
          </section>

          {features.length > 0 && (
            <section className="zipree-vdp__features-section">
              <div className="zipree-vdp__section-heading">
                <span className="zipree-vdp__section-index">02</span>
                <div>
                  <p className="zipree-vdp__section-kicker">MADE FOR YOUR JOURNEY</p>
                  <h2 className="zipree-vdp__section-title">Signature Features</h2>
                </div>
              </div>
              <ul className="zipree-vdp__features-grid">
                {features.map((feature, index) => (
                  <motion.li key={`${feature}-${index}`} className="zipree-vdp__feature-item" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.35, delay: index * 0.04 }}>
                    <span className="zipree-vdp__feature-icon">✓</span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </section>
          )}

          <section className="zipree-vdp__specifications">
            <div className="zipree-vdp__section-heading">
              <span className="zipree-vdp__section-index">03</span>
              <div>
                <p className="zipree-vdp__section-kicker">THE DETAILS THAT MATTER</p>
                <h2 className="zipree-vdp__section-title">Vehicle Specifications</h2>
              </div>
            </div>
            <div className="zipree-vdp__specs-grid">
              <div className="zipree-vdp__spec-box">
                <span className="zipree-vdp__spec-icon"><DetailIcon type="transmission" /></span>
                <span className="zipree-vdp__spec-label">Transmission</span>
                <span className="zipree-vdp__spec-value">{car.transmission || "Not specified"}</span>
              </div>
              <div className="zipree-vdp__spec-box">
                <span className="zipree-vdp__spec-icon"><DetailIcon type="fuel" /></span>
                <span className="zipree-vdp__spec-label">Fuel Type</span>
                <span className="zipree-vdp__spec-value">{car.fuel || "Not specified"}</span>
              </div>
              <div className="zipree-vdp__spec-box">
                <span className="zipree-vdp__spec-icon"><DetailIcon type="seats" /></span>
                <span className="zipree-vdp__spec-label">Seating</span>
                <span className="zipree-vdp__spec-value">{car.seating ? `${car.seating} Adults` : "Not specified"}</span>
              </div>
              <div className="zipree-vdp__spec-box">
                <span className="zipree-vdp__spec-icon"><DetailIcon type="category" /></span>
                <span className="zipree-vdp__spec-label">Category</span>
                <span className="zipree-vdp__spec-value">{car.category || "Not specified"}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="zipree-vdp__right-col">
          <div className="zipree-vdp__booking-panel">
            <div className="zipree-vdp__panel-topline">
              <span className="zipree-vdp__panel-dot" />
              VEHICLE RESERVATION
            </div>
            <div className="zipree-vdp__panel-header">
              <p className="zipree-vdp__panel-label">Starting from</p>
              <div className="zipree-vdp__panel-price">{formatCurrency(dailyPrice)}<span>/ day</span></div>
            </div>
            <div className="zipree-vdp__panel-body">
              <div className="zipree-vdp__panel-field">
                <label htmlFor="vdp-pickup-location"><DetailIcon type="location" />Pickup Location</label>
                <VehicleDropdown value={pickupLocation} onChange={(value) => { setPickupLocation(value); setBookingMessage(""); }} options={PICKUP_LOCATIONS} placeholder="Choose pickup location" className="zipree-vdp-dropdown--booking" />
              </div>
              <div className="zipree-vdp__date-row">
                <div className="zipree-vdp__panel-field">
                  <label htmlFor="vdp-pickup-date"><DetailIcon type="calendar" />Pickup Date</label>
                  <input id="vdp-pickup-date" type="date" min={getToday()} value={pickupDate} onChange={(event) => handlePickupDate(event.target.value)} className="zipree-vdp__panel-input" />
                </div>
                <div className="zipree-vdp__panel-field">
                  <label htmlFor="vdp-return-date"><DetailIcon type="calendar" />Return Date</label>
                  <input id="vdp-return-date" type="date" min={pickupDate || getToday()} value={returnDate} onChange={(event) => { setReturnDate(event.target.value); setBookingMessage(""); }} className="zipree-vdp__panel-input" disabled={!pickupDate} />
                </div>
              </div>
              <div className="zipree-vdp__panel-divider" />
              <div className="zipree-vdp__estimate">
                <div className="zipree-vdp__estimate-row">
                  <span>Daily rental rate</span>
                  <span>{formatCurrency(dailyPrice)}</span>
                </div>
                <div className="zipree-vdp__estimate-row">
                  <span>Rental duration</span>
                  <span>{rentalDays > 0 ? `${rentalDays} ${rentalDays === 1 ? "day" : "days"}` : "Select dates"}</span>
                </div>
                <div className="zipree-vdp__panel-total">
                  <span>Estimated Total</span>
                  <strong>{formatCurrency(estimatedTotal)}</strong>
                </div>
                <p className="zipree-vdp__estimate-note">Estimate based on the daily rate. Final charges and availability must be confirmed through checkout.</p>
              </div>
              {bookingMessage && (
                <motion.p className="zipree-vdp__booking-message" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} role="status">{bookingMessage}</motion.p>
              )}
              <button type="button" className="zipree-vdp__reserve-btn" onClick={handleReserve}>
                <span>Continue to Reservation</span>
                <span aria-hidden="true">↗</span>
              </button>
              <p className="zipree-vdp__secure-note">A seamless journey begins with the right vehicle.</p>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {isLightboxOpen && images.length > 0 && (
          <motion.div className="zipree-vdp__lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => { if (event.target === event.currentTarget) setIsLightboxOpen(false); }}>
            <button type="button" className="zipree-vdp__lightbox-close" onClick={() => setIsLightboxOpen(false)} aria-label="Close image viewer">×</button>
            <button type="button" className="zipree-vdp__lightbox-arrow zipree-vdp__lightbox-arrow--left" onClick={() => changeImage(-1)} aria-label="Previous image">‹</button>
            <motion.img key={activeImage} src={images[activeImage]} alt={`${car.brand} ${car.model} gallery image ${activeImage + 1}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            <button type="button" className="zipree-vdp__lightbox-arrow zipree-vdp__lightbox-arrow--right" onClick={() => changeImage(1)} aria-label="Next image">›</button>
            <span className="zipree-vdp__lightbox-count">{activeImage + 1} / {images.length}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="zipree-vdp__mobile-booking-bar">
        <div>
          <span>Starting from</span>
          <strong>{formatCurrency(dailyPrice)} <small>/ day</small></strong>
        </div>
        <button type="button" onClick={() => document.querySelector(".zipree-vdp__booking-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
          Reserve Vehicle <span aria-hidden="true">↗</span>
        </button>
      </div>
    </main>
  );
}