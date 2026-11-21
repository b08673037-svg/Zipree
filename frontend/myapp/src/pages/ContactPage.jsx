
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/apiClient.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import useReducedMotion from "../hooks/useReducedMotion.js";
import "./ContactPage.css";

const FAQS = [
  {
    q: "How do I extend my rental period?",
    a: "You can extend your rental by contacting our support team directly. Please note that extensions are subject to vehicle availability.",
  },
  {
    q: "What documents do I need to rent a car?",
    a: "You will need a valid driver's license, a national ID or passport, and a valid credit card for the security deposit.",
  },
  {
    q: "Can I pick up the car from a different location?",
    a: "Currently, pickups must be made at the designated location chosen during the booking process. Delivery options may be available upon request.",
  },
];

const SUBJECTS = [
  "General Inquiry",
  "Vehicle Availability",
  "Existing Reservation",
  "Booking Assistance",
  "Business Partnership",
  "Other",
];

const SUBJECT_OPTIONS = SUBJECTS.map((subject) => ({
  label: subject,
  value: subject,
}));

/* =========================================
   CUSTOM ZIPREE DROPDOWN
========================================= */

function ContactDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  ariaLabel = "Select an option",
}) {
  const dropdownRef = useRef(null);
  const dropdownId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex(
    (option) => option.value === value
  );

  const selectedOption =
    selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openDropdown = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen((previous) => !previous);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (
      ["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }

    if (event.key === "ArrowDown") {
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setActiveIndex((previous) =>
          Math.min(previous + 1, options.length - 1)
        );
      }
    }

    if (event.key === "ArrowUp") {
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setActiveIndex((previous) => Math.max(previous - 1, 0));
      }
    }

    if (event.key === "Home" && isOpen) {
      setActiveIndex(0);
    }

    if (event.key === "End" && isOpen) {
      setActiveIndex(options.length - 1);
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      isOpen
    ) {
      selectOption(options[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="zipree-dropdown zipree-contact-dropdown"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`zipree-dropdown__trigger ${
          isOpen ? "zipree-dropdown__trigger--open" : ""
        }`}
        onClick={openDropdown}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        <span
          className={`zipree-dropdown__value ${
            selectedOption ? "" : "zipree-dropdown__value--placeholder"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span
          className={`zipree-dropdown__arrow ${
            isOpen ? "zipree-dropdown__arrow--open" : ""
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={dropdownId}
            className="zipree-dropdown__menu"
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="zipree-dropdown__options">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`zipree-dropdown__option ${
                      isSelected
                        ? "zipree-dropdown__option--selected"
                        : ""
                    } ${
                      isActive
                        ? "zipree-dropdown__option--active"
                        : ""
                    }`}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span>{option.label}</span>

                    {isSelected && (
                      <span className="zipree-dropdown__check">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 12.5L9.5 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
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
   CONTACT PAGE
========================================= */

export default function ContactPage() {
  useDocumentTitle("Contact");
  const reduce = useReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      setErrorMessage("Please select a subject before sending your message.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await api.post("/contact", formData);

      setStatus("success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to send message. Please try again."
      );
    }
  };

  const handleShortcut = (subject) => {
    setFormData((previous) => ({
      ...previous,
      subject,
    }));

    document
      .querySelector("#contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="zipree-contact">

      {/* SECTION 01: HERO */}
      <section className="zipree-contact-hero">
        <div className="zipree-contact-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury car"
          />
          <div className="zipree-contact-hero__overlay" />
        </div>

        <div className="zipree-contact-hero__content">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="zipree-contact-hero__eyebrow"
          >
            Get in Touch
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="zipree-contact-hero__title"
          >
            Every Great Journey
            <br />
            <span className="zipree-contact-hero__title-gold">
              Starts With a Conversation.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* SECTION 02: SHORTCUTS */}
      <section className="zipree-contact-shortcuts">
        <div className="zipree-contact-shortcuts__container">
          <button
            onClick={() => handleShortcut("Vehicle Availability")}
            className="zipree-contact-shortcut-btn"
          >
            Vehicle Assistance
          </button>

          <button
            onClick={() => handleShortcut("Existing Reservation")}
            className="zipree-contact-shortcut-btn"
          >
            Reservation Support
          </button>

          <button
            onClick={() => handleShortcut("Business Partnership")}
            className="zipree-contact-shortcut-btn"
          >
            Business Inquiries
          </button>
        </div>
      </section>

      {/* SECTION 03: MAIN FORM */}
      <section className="zipree-contact-main" id="contact-form">
        <div className="zipree-contact-main__container">

          {/* Left Side: Info */}
          <div className="zipree-contact-info">
            <h2 className="zipree-contact-info__title">
              Contact Information
            </h2>

            <p className="zipree-contact-info__desc">
              Our team is available to assist you with any questions or inquiries.
            </p>

            <div className="zipree-contact-info__item">
              <span className="zipree-contact-info__label">Phone</span>
              <p>+92 300 1234567</p>
            </div>

            <div className="zipree-contact-info__item">
              <span className="zipree-contact-info__label">Email</span>
              <p>hello@zipree.com</p>
            </div>

            <div className="zipree-contact-info__item">
              <span className="zipree-contact-info__label">Address</span>
              <p>123 Luxury Avenue, Lahore, Pakistan</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="zipree-contact-form-wrapper">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="zipree-contact-success"
              >
                <div className="zipree-contact-success__icon">✓</div>

                <h3>Message Sent</h3>

                <p>
                  Thank you for reaching out. A member of our concierge team
                  will contact you shortly.
                </p>
              </motion.div>
            ) : (
              <form
                className="zipree-contact-form"
                onSubmit={handleSubmit}
              >
                <div className="zipree-contact-form__row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="zipree-contact-form__row">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <ContactDropdown
                    value={formData.subject}
                    onChange={(value) => {
                      setFormData((previous) => ({
                        ...previous,
                        subject: value,
                      }));
                      setErrorMessage("");
                    }}
                    options={SUBJECT_OPTIONS}
                    placeholder="Select Subject"
                    ariaLabel="Select contact subject"
                  />
                </div>

                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

                {status === "error" && (
                  <p className="zipree-contact-form__error">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="zipree-contact-form__btn"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 04: FAQ */}
      <section className="zipree-contact-faq">
        <div className="zipree-contact-faq__container">
          <h2 className="zipree-contact-faq__title">
            Frequently Asked Questions
          </h2>

          <div className="zipree-contact-faq__list">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="zipree-contact-faq__item"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="zipree-contact-faq__question"
                  aria-expanded={openFaq === index}
                >
                  {faq.q}

                  <span>
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="zipree-contact-faq__answer"
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 05: FINAL CTA */}
      <section className="zipree-contact-cta">
        <div className="zipree-contact-cta__bg">
          <img
            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2000&auto=format&fit=crop"
            alt="Open road"
          />

          <div className="zipree-contact-cta__overlay" />
        </div>

        <div className="zipree-contact-cta__content">
          <h2>Your Next Journey Is Worth Talking About.</h2>

          <Link to="/fleet" className="zipree-contact-cta__btn">
            Explore Our Fleet
          </Link>
        </div>
      </section>

    </main>
  );
}
