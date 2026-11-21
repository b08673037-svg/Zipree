import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import "./HowItWorks.css";

const STEPS = [
  {
    number: "01",
    title: "Find Your Perfect Ride.",
    desc: "Explore our curated fleet and discover a vehicle that matches your style, preferences, and journey.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: "02",
    title: "Make It Yours.",
    desc: "Select your rental dates, review the available vehicle details, and choose the options that suit your journey.",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: "03",
    title: "You're Almost There.",
    desc: "Review your reservation details and complete the booking process through our platform.",
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: "04",
    title: "Take the Wheel.",
    desc: "Once your reservation is confirmed, follow the agreed pickup instructions and enjoy your drive.",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="zipree-how">
      <div className="zipree-how__container">
        
        {/* Header */}
        <motion.div 
          className="zipree-how__header"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={reduce ? {} : containerVariants}
        >
          <motion.p variants={reduce ? {} : itemVariants} className="zipree-how__eyebrow">
            Your Journey Starts Here
          </motion.p>
          <motion.h2 variants={reduce ? {} : itemVariants} className="zipree-how__title">
            Your Next Drive, <span className="zipree-how__title-gold">Made Simple.</span>
          </motion.h2>
          <motion.p variants={reduce ? {} : itemVariants} className="zipree-how__desc">
            From discovering your perfect vehicle to getting behind the wheel, experience a rental process designed around simplicity and comfort.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="zipree-how__steps-wrapper">
          {/* The horizontal timeline line (Desktop) */}
          <div className="zipree-how__timeline" aria-hidden="true">
            <motion.div 
              className="zipree-how__timeline-progress"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <motion.div 
            className="zipree-how__steps"
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={reduce ? {} : containerVariants}
          >
            {STEPS.map((step) => (
              <motion.div 
                key={step.number} 
                className="zipree-how__step"
                variants={reduce ? {} : itemVariants}
              >
                {/* Step Number Badge */}
                <div className="zipree-how__number-wrapper">
                  <div className="zipree-how__number">{step.number}</div>
                </div>

                {/* Step Content */}
                <div className="zipree-how__step-content">
                  <div className="zipree-how__image-wrap">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="zipree-how__image"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="zipree-how__step-title">{step.title}</h3>
                  <p className="zipree-how__step-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div 
          className="zipree-how__cta-wrapper"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="zipree-how__cta-text">Ready to Find Your Drive?</p>
          <Link to="/fleet" className="zipree-how__cta-btn">
            Explore Our Fleet
          </Link>
        </motion.div>

      </div>
    </section>
  );
}