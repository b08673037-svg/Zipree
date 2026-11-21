import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import "./Testimonials.css";

// DEMO DATA: Replace with real reviews from your backend later
const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Morgan",
    vehicle: "Mercedes-Benz S-Class",
    review: "From choosing the vehicle to completing my reservation, everything felt effortless. The entire experience was smooth, professional, and exactly what I expected from a premium car rental service.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "James Wilson",
    vehicle: "Porsche 911 Carrera",
    review: "The vehicle was exactly what I was looking for. I appreciated how straightforward the booking experience was and how easy it was to find the right car for my trip.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Daniel Carter",
    vehicle: "Range Rover Autobiography",
    review: "A refined experience from beginning to end. The platform made it easy to explore the fleet and manage my reservation without unnecessary complications.",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const reduce = useReducedMotion();

  const currentTestimonial = TESTIMONIALS[currentIndex];

  // Handle Next/Prev
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  // Autoplay Logic
  useEffect(() => {
    if (reduce || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000); // 6 seconds per slide

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, reduce]);

  // Animation Variants
  const textVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.4 } },
  };

  const imageVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  };

  return (
    <section 
      className="zipree-testimonials"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="zipree-testimonials__container">
        
        {/* Header */}
        <motion.div 
          className="zipree-testimonials__header"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="zipree-testimonials__eyebrow">The ZIPREE Experience</p>
          <h2 className="zipree-testimonials__title">Experiences Worth Sharing.</h2>
        </motion.div>

        {/* Main Slider Area */}
        <div className="zipree-testimonials__slider">
          
          {/* Left: Text */}
          <div className="zipree-testimonials__content">
            <div className="zipree-testimonials__quote-mark">"</div>
            
            <div className="zipree-testimonials__text-wrapper">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial.id}
                  variants={reduce ? {} : textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <p className="zipree-testimonials__review">
                    "{currentTestimonial.review}"
                  </p>
                  
                  <div className="zipree-testimonials__author">
                    <div>
                      <p className="zipree-testimonials__name">{currentTestimonial.name}</p>
                      <p className="zipree-testimonials__vehicle">
                        Rented: {currentTestimonial.vehicle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="zipree-testimonials__controls">
              <div className="zipree-testimonials__arrows">
                <button onClick={handlePrev} className="zipree-testimonials__btn" aria-label="Previous review">
                  ←
                </button>
                <span className="zipree-testimonials__count">
                  0{currentIndex + 1} / 0{TESTIMONIALS.length}
                </span>
                <button onClick={handleNext} className="zipree-testimonials__btn" aria-label="Next review">
                  →
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="zipree-testimonials__progress-track">
                <motion.div 
                  className="zipree-testimonials__progress-fill"
                  initial={false}
                  animate={{ width: `${((currentIndex + 1) / TESTIMONIALS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="zipree-testimonials__image-wrapper">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentTestimonial.id}
                src={currentTestimonial.image}
                alt={currentTestimonial.vehicle}
                className="zipree-testimonials__image"
                variants={reduce ? {} : imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </AnimatePresence>
            <div className="zipree-testimonials__image-border" />
          </div>

        </div>
      </div>
    </section>
  );
}