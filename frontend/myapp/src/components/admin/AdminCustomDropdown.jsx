import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import "./AdminCustomDropdown.css";

export default function AdminCustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  ariaLabel = "Select an option",
}) {
  const dropdownRef = useRef(null);
  const dropdownId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
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
    setIsOpen((prev) => !prev);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!options.length) return;
    if (!isOpen && ["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((p) => (p + 1) % options.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => (p - 1 + options.length) % options.length); }
    if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); }
    if (e.key === "End") { e.preventDefault(); setActiveIndex(options.length - 1); }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(options[activeIndex]);
    }
  };

  return (
    <div className={`zipree-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`zipree-dropdown__trigger ${isOpen ? "is-open" : ""}`}
        onClick={openDropdown}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        <span className="zipree-dropdown__value">
          {selectedOption?.label || placeholder}
        </span>
        <motion.span
          className="zipree-dropdown__arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="zipree-dropdown__menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="zipree-dropdown__options"
              id={dropdownId}
              role="listbox"
              aria-label={ariaLabel}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`zipree-dropdown__option ${isSelected ? "is-selected" : ""} ${activeIndex === index ? "is-active" : ""}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <FiCheck className="zipree-dropdown__check" />}
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