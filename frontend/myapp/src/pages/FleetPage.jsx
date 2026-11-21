import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getAllCars } from "../lib/fleetApi.js";
import FleetCard from "../components/fleet/FleetCard.jsx";
import "./FleetPage.css";

const TRANSMISSION_OPTIONS = [
  { label: "Any Transmission", value: "" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const FUEL_OPTIONS = [
  { label: "Any Fuel Type", value: "" },
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Electric", value: "electric" },
  { label: "Hybrid", value: "hybrid" },
];

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "-createdAt" },
  { label: "Price: Low to High", value: "dailyPrice" },
  { label: "Price: High to Low", value: "-dailyPrice" },
];

const CATEGORY_TABS = [
  { label: "All Vehicles", value: "" },
  { label: "Luxury", value: "luxury" },
  { label: "Sports", value: "sports" },
  { label: "SUV", value: "suv" },
  { label: "Sedan", value: "sedan" },
  { label: "Electric", value: "electric" },
  { label: "Economy", value: "economy" },
];

/* =========================================
   REUSABLE ZIPREE CUSTOM DROPDOWN
========================================= */
function FleetDropdown({ value, onChange, options, placeholder = "Select an option", className = "", ariaLabel = "Select an option" }) {
  const dropdownRef = useRef(null);
  const dropdownId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value) || null;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openDropdown = () => { setActiveIndex(selectedIndex); setIsOpen(true); };
  const selectOption = (option) => { onChange(option.value); setIsOpen(false); };
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); if (!isOpen) { openDropdown(); return; } setActiveIndex((c) => Math.min(c + 1, options.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); if (!isOpen) { openDropdown(); return; } setActiveIndex((c) => Math.max(c - 1, 0)); }
    if (event.key === "Home" && isOpen) { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End" && isOpen) { event.preventDefault(); setActiveIndex(options.length - 1); }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!isOpen) openDropdown(); else if (options[activeIndex]) selectOption(options[activeIndex]); }
    if (event.key === "Escape" && isOpen) { event.preventDefault(); setIsOpen(false); }
  };

  return (
    <div ref={dropdownRef} className={`zipree-dropdown ${className} ${isOpen ? "is-open" : ""}`}>
      <button type="button" className={`zipree-dropdown__trigger ${isOpen ? "is-open" : ""}`} onClick={() => { if (isOpen) setIsOpen(false); else openDropdown(); }} onKeyDown={handleKeyDown} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={`${dropdownId}-listbox`} aria-activedescendant={isOpen ? `${dropdownId}-option-${activeIndex}` : undefined}>
        <span className="zipree-dropdown__value">{selectedOption?.label || placeholder}</span>
        <motion.span className="zipree-dropdown__arrow" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22, ease: "easeInOut" }}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div id={`${dropdownId}-listbox`} className="zipree-dropdown__menu" role="listbox" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <div className="zipree-dropdown__options">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <button key={option.value || "all"} id={`${dropdownId}-option-${index}`} type="button" role="option" aria-selected={isSelected} className={`zipree-dropdown__option ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOption(option)}>
                    <span>{option.label}</span>
                    {isSelected && (<svg className="zipree-dropdown__check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 10.5L8 14L15.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
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
   REUSABLE FLEET FILTER FIELDS
========================================= */
function SearchFilter({ value, onChange, id }) {
  return (
    <div className="zipree-filter-group">
      <label htmlFor={id}>Search</label>
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Brand or model..." className="zipree-filter-input" />
    </div>
  );
}

function PriceFilter({ minPrice, maxPrice, onMinChange, onMaxChange, prefix }) {
  return (
    <div className="zipree-filter-group">
      <label>Price Range</label>
      <div className="zipree-filter-price-inputs">
        <input type="number" min="0" value={minPrice} onChange={(e) => onMinChange(e.target.value)} placeholder="Min" className="zipree-filter-input" aria-label={`${prefix} minimum price`} />
        <span>-</span>
        <input type="number" min="0" value={maxPrice} onChange={(e) => onMaxChange(e.target.value)} placeholder="Max" className="zipree-filter-input" aria-label={`${prefix} maximum price`} />
      </div>
    </div>
  );
}

function TransmissionFilter({ value, onChange }) {
  return (
    <div className="zipree-filter-group">
      <label>Transmission</label>
      <FleetDropdown value={value} onChange={onChange} options={TRANSMISSION_OPTIONS} placeholder="Any Transmission" ariaLabel="Filter by transmission" className="zipree-dropdown--filter" />
    </div>
  );
}

function FuelFilter({ value, onChange }) {
  return (
    <div className="zipree-filter-group">
      <label>Fuel Type</label>
      <FleetDropdown value={value} onChange={onChange} options={FUEL_OPTIONS} placeholder="Any Fuel Type" ariaLabel="Filter by fuel type" className="zipree-dropdown--filter" />
    </div>
  );
}

/* =========================================
   MAIN FLEET PAGE
========================================= */
export default function FleetPage() {
  useDocumentTitle("The Fleet");

  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const gridRef = useRef(null); // Ref for scrolling to top on page change

  // Data State
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read state from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentMin = searchParams.get("minPrice") || "";
  const currentMax = searchParams.get("maxPrice") || "";
  const currentTrans = searchParams.get("transmission") || "";
  const currentFuel = searchParams.get("fuel") || "";
  const currentSort = searchParams.get("sort") || "-createdAt";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Helper to update URL
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // When changing a filter (not pagination), reset to page 1
    if (key !== "page") {
      newParams.delete("page");
    }

    if (value) newParams.set(key, value);
    else newParams.delete(key);
    
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  // Fetch Data when URL changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    async function fetchData() {
      try {
        const res = await getAllCars({
          category: currentCategory,
          search: currentSearch,
          minPrice: currentMin,
          maxPrice: currentMax,
          transmission: currentTrans,
          fuel: currentFuel,
          sort: currentSort,
          page: currentPage,
          limit: 9 // Let's use 9 so pagination is visible if we have >9 cars
        });
        
        if (isMounted) {
          setCars(res.cars);
          setTotalCount(res.total);
          setTotalPages(res.pages || 1);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load vehicles.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Debounce search slightly
    const timer = setTimeout(fetchData, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentCategory, currentSearch, currentMin, currentMax, currentTrans, currentFuel, currentSort, currentPage]);

  // Scroll to top of grid when page changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  useEffect(() => {
    if (!isMobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobileFilterOpen]);

  const closeMobileFilters = () => setIsMobileFilterOpen(false);

  return (
    <main className="zipree-fleet-page">
      {/* 1. FLEET HERO */}
      <section className="zipree-fleet-hero">
        <div className="zipree-fleet-hero__inner">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="zipree-fleet-hero__eyebrow">The ZIPREE Collection</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="zipree-fleet-hero__title">Find Your Perfect Drive.</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="zipree-fleet-hero__desc">Explore a carefully selected collection of vehicles, designed to make every journey exceptional.</motion.p>
        </div>
      </section>

      {/* 2. CATEGORY TABS */}
      <div className="zipree-fleet-categories-wrapper">
        <div className="zipree-fleet-categories">
          {CATEGORY_TABS.map((cat) => (
            <button key={cat.value || "all"} type="button" onClick={() => updateFilters("category", cat.value)} className={`zipree-fleet-cat-btn ${currentCategory === cat.value ? "is-active" : ""}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="zipree-fleet-container">
        <aside className="zipree-fleet-sidebar">
          <div className="zipree-fleet-sidebar__header">
            <h3>Filters</h3>
            <button type="button" className="zipree-fleet-sidebar__clear" onClick={clearFilters}>Clear All</button>
          </div>
          <SearchFilter id="fleet-search-desktop" value={currentSearch} onChange={(val) => updateFilters("search", val)} />
          <PriceFilter prefix="Desktop" minPrice={currentMin} maxPrice={currentMax} onMinChange={(val) => updateFilters("minPrice", val)} onMaxChange={(val) => updateFilters("maxPrice", val)} />
          <TransmissionFilter value={currentTrans} onChange={(val) => updateFilters("transmission", val)} />
          <FuelFilter value={currentFuel} onChange={(val) => updateFilters("fuel", val)} />
        </aside>

        <section className="zipree-fleet-content" ref={gridRef}>
          <div className="zipree-fleet-toolbar">
            <div className="zipree-fleet-toolbar__count">
              Showing <strong>{totalCount}</strong> vehicles {totalPages > 1 && `| Page ${currentPage} of ${totalPages}`}
            </div>
            <div className="zipree-fleet-toolbar__actions">
              <button type="button" className="zipree-fleet-filter-trigger" onClick={() => setIsMobileFilterOpen(true)}>Filters</button>
              <FleetDropdown value={currentSort} onChange={(val) => updateFilters("sort", val)} options={SORT_OPTIONS} className="zipree-dropdown--sort" ariaLabel="Sort vehicles" />
            </div>
          </div>

          {/* DATA GRID */}
          <div className="zipree-fleet-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="zipree-fleet-skeleton">
                  <div className="zipree-fleet-skeleton__img" />
                  <div className="zipree-fleet-skeleton__content">
                    <div className="zipree-fleet-skeleton__title" />
                    <div className="zipree-fleet-skeleton__specs" />
                    <div className="zipree-fleet-skeleton__price" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div style={{ padding: "40px", color: "var(--color-silver)" }}>{error}</div>
            ) : cars.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--color-ivory)", marginBottom: "12px" }}>No vehicles found</h3>
                <p style={{ color: "var(--color-silver)", marginBottom: "24px" }}>Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} style={{ background: "var(--color-champagne)", color: "var(--color-charcoal)", border: "none", padding: "12px 24px", borderRadius: "2px", fontWeight: 600, cursor: "pointer" }}>Clear Filters</button>
              </div>
            ) : (
              cars.map((car) => <FleetCard key={car._id} car={car} />)
            )}
          </div>

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
             <div className="zipree-fleet-pagination">
              <button type="button" onClick={() => updateFilters("page", (currentPage - 1).toString())} disabled={currentPage === 1}>Previous</button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum} type="button" onClick={() => updateFilters("page", pageNum.toString())} className={currentPage === pageNum ? "is-active" : ""}>
                    {pageNum}
                  </button>
                );
              })}
              
              <button type="button" onClick={() => updateFilters("page", (currentPage + 1).toString())} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div className="zipree-fleet-mobile-filter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) closeMobileFilters(); }}>
            <motion.div className="zipree-fleet-mobile-filter__panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <div className="zipree-fleet-mobile-filter__header">
                <h3>Filters</h3>
                <button type="button" aria-label="Close filters" onClick={closeMobileFilters}>✕</button>
              </div>
              <div className="zipree-fleet-mobile-filter__body">
                <SearchFilter id="fleet-search-mobile" value={currentSearch} onChange={(val) => updateFilters("search", val)} />
                <PriceFilter prefix="Mobile" minPrice={currentMin} maxPrice={currentMax} onMinChange={(val) => updateFilters("minPrice", val)} onMaxChange={(val) => updateFilters("maxPrice", val)} />
                <TransmissionFilter value={currentTrans} onChange={(val) => updateFilters("transmission", val)} />
                <FuelFilter value={currentFuel} onChange={(val) => updateFilters("fuel", val)} />
                <button type="button" className="zipree-fleet-mobile-filter__clear" onClick={clearFilters} style={{ marginBottom: "16px", width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-silver)", padding: "12px" }}>Clear All Filters</button>
                <button type="button" className="zipree-fleet-mobile-filter__apply" onClick={closeMobileFilters} style={{ width: "100%", background: "var(--color-champagne)", color: "var(--color-charcoal)", padding: "14px", border: "none", fontWeight: 600 }}>Show Vehicles</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}