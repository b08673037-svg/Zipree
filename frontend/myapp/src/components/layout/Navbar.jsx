// ZIPREE — Premium luxury navbar
// Desktop: three zones (brand | nav | actions)
// Mobile: brand | wishlist+menu toggle → fullscreen overlay menu
// Scroll: transparent at top → charcoal + blur on scroll
// Explore Cars: hover/focus mega-dropdown with 6 categories

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Logo from "../brand/Logo.jsx";
import useAuth from "../../hooks/useAuth.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./Navbar.css";

const CATEGORIES = [
  { slug: "economy", label: "Economy", blurb: "Smart, efficient, everyday." },
  { slug: "sedan", label: "Sedan", blurb: "Refined comfort for the long road." },
  { slug: "suv", label: "SUV", blurb: "Space, height, and command." },
  { slug: "sports", label: "Sports", blurb: "Every exit, a grand entrance." },
  { slug: "luxury", label: "Luxury", blurb: "Flagship presence. Quiet power." },
  { slug: "electric", label: "Electric", blurb: "Silent speed. Zero compromise." },
];

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/fleet", label: "Explore Cars", dropdown: true },
  { to: "/experience", label: "Our Experience" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const exploreRef = useRef(null);
  const exploreTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const reduce = useReducedMotion();

  // Close menus on route change
  useEffect(() => {
    setExploreOpen(false);
    setMobileOpen(false);
    setMobileExploreOpen(false);
  }, [location.pathname, location.hash]);

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body scroll lock while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Escape key closes any open menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setExploreOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close explore dropdown on outside click
  useEffect(() => {
    if (!exploreOpen) return;
    const onClick = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [exploreOpen]);

  const openExplore = () => {
    if (exploreTimeout.current) clearTimeout(exploreTimeout.current);
    setExploreOpen(true);
  };
  const closeExplore = () => {
    exploreTimeout.current = setTimeout(() => setExploreOpen(false), 100);
  };

  const wishlistHref = isAuthenticated ? "/dashboard/wishlist" : "/login?redirect=/dashboard/wishlist";
  const accountHref = isAuthenticated ? "/dashboard" : "/login";

  const handleCategoryClick = (slug) => {
    setExploreOpen(false);
    setMobileOpen(false);
    navigate(`/fleet?category=${slug}`);
  };

  return (
    <motion.header
      className={`zipree-navbar ${scrolled ? "zipree-navbar--scrolled" : ""}`}
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="zipree-navbar__inner">
        {/* Left — brand */}
        <Link to="/" className="zipree-navbar__brand" aria-label="ZIPREE home">
          <Logo />
        </Link>

        {/* Center — primary navigation */}
        <nav className="zipree-navbar__nav" aria-label="Primary">
          <ul className="zipree-navbar__links">
            {PRIMARY_LINKS.map((link) =>
              link.dropdown ? (
                <li
                  key={link.to}
                  ref={exploreRef}
                  className="zipree-navbar__item zipree-navbar__item--has-dropdown"
                  onMouseEnter={openExplore}
                  onMouseLeave={closeExplore}
                >
                  <button
                    type="button"
                    className={`zipree-navbar__link ${exploreOpen ? "is-open" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={exploreOpen}
                    onClick={() => setExploreOpen((v) => !v)}
                  >
                    {link.label}
                    <svg className="zipree-navbar__chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {exploreOpen && (
                      <motion.div
                        className="zipree-navbar__dropdown"
                        initial={reduce ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onMouseEnter={openExplore}
                        onMouseLeave={closeExplore}
                      >
                        <div className="zipree-navbar__dropdown-grid">
                          {CATEGORIES.map((c) => (
                            <button
                              key={c.slug}
                              type="button"
                              className="zipree-navbar__dropdown-item"
                              onClick={() => handleCategoryClick(c.slug)}
                            >
                              <span className="zipree-navbar__dropdown-label">{c.label}</span>
                              <span className="zipree-navbar__dropdown-blurb">{c.blurb}</span>
                            </button>
                          ))}
                        </div>
                        <Link to="/fleet" className="zipree-navbar__dropdown-footer">
                          View all cars <span aria-hidden="true">→</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={link.to} className="zipree-navbar__item">
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `zipree-navbar__link ${isActive ? "is-active" : ""}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Right — actions */}
        <div className="zipree-navbar__actions">
          <Link
            to={wishlistHref}
            className="zipree-navbar__icon-btn"
            aria-label="Wishlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
          </Link>

          {isAuthenticated ? (
            <Link to={accountHref} className="zipree-navbar__profile-btn" aria-label="My Account">
              <div className="zipree-navbar__avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>
          ) : (
            <Link to={accountHref} className="zipree-navbar__account">
              Log in
            </Link>
          )}

          <Link to="/fleet" className="zipree-navbar__cta">
            Reserve a Car
          </Link>

          <button
            type="button"
            className="zipree-navbar__menu-toggle"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="zipree-mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="zipree-mobile-menu"
            className="zipree-navbar__mobile"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="zipree-navbar__mobile-head">
              <Link to="/" className="zipree-navbar__brand" aria-label="ZIPREE home">
                <Logo variant="mark" theme="light" size={32} />
              </Link>
              <button
                type="button"
                className="zipree-navbar__mobile-close"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6 L18 18 M18 6 L6 18"/>
                </svg>
              </button>
            </div>

            <nav className="zipree-navbar__mobile-nav" aria-label="Mobile">
              {PRIMARY_LINKS.map((link, i) => {
                if (link.dropdown) {
                  return (
                    <motion.div
                      key={link.to}
                      className="zipree-navbar__mobile-group"
                      initial={reduce ? false : { opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        type="button"
                        className={`zipree-navbar__mobile-link zipree-navbar__mobile-link--toggle ${mobileExploreOpen ? "is-open" : ""}`}
                        aria-expanded={mobileExploreOpen}
                        onClick={() => setMobileExploreOpen((v) => !v)}
                      >
                        {link.label}
                        <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
                          <path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileExploreOpen && (
                          <motion.ul
                            className="zipree-navbar__mobile-sub"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {CATEGORIES.map((c) => (
                              <li key={c.slug}>
                                <button
                                  type="button"
                                  className="zipree-navbar__mobile-sublink"
                                  onClick={() => handleCategoryClick(c.slug)}
                                >
                                  {c.label}
                                </button>
                              </li>
                            ))}
                            <li>
                              <Link to="/fleet" className="zipree-navbar__mobile-sublink">
                                View all cars
                              </Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={link.to}
                    initial={reduce ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `zipree-navbar__mobile-link ${isActive ? "is-active" : ""}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                );
              })}

              <motion.div
                className="zipree-navbar__mobile-divider"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              />

              <motion.div
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={wishlistHref}
                  className="zipree-navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Wishlist
                </Link>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.46, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={accountHref}
                  className="zipree-navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {isAuthenticated ? "My Account" : "Log in"}
                </Link>
              </motion.div>

              <motion.div
                className="zipree-navbar__mobile-cta-wrap"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to="/fleet"
                  className="zipree-navbar__mobile-cta"
                  onClick={() => setMobileOpen(false)}
                >
                  Reserve a Car
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}