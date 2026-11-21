import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import "./BrandStory.css";

export default function BrandStory() {
  const reduce = useReducedMotion();

  // Image Mask Reveal Animation
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // Text Fade/Slide Up Animation
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="zipree-story">
      <div className="zipree-story__container">
        
        {/* Left Side: Cinematic Image */}
        <motion.div 
          className="zipree-story__image-wrap"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={reduce ? {} : imageVariants}
        >
          <img 
            src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1500&auto=format&fit=crop" 
            alt="ZIPREE luxury vehicle in a dark studio" 
            className="zipree-story__image"
            loading="lazy"
          />
          <div className="zipree-story__image-overlay" />
        </motion.div>

        {/* Right Side: Editorial Text */}
        <div className="zipree-story__content">
          <motion.div
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={reduce ? {} : { visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.p variants={reduce ? {} : textVariants} className="zipree-story__eyebrow">
              01 / The ZIPREE Philosophy
            </motion.p>
            
            <motion.h2 variants={reduce ? {} : textVariants} className="zipree-story__title">
              More Than a Drive.<br />
              It's an <span className="zipree-story__title-gold">Experience.</span>
            </motion.h2>

            <motion.div variants={reduce ? {} : textVariants} className="zipree-story__divider" />

            <motion.p variants={reduce ? {} : textVariants} className="zipree-story__desc">
              At ZIPREE, we believe every journey deserves something exceptional. 
              From carefully selected vehicles to a seamless rental experience, 
              we bring together performance, comfort, and sophistication to make 
              every mile memorable.
            </motion.p>

            <motion.div variants={reduce ? {} : textVariants}>
              <Link to="/about" className="zipree-story__link">
                Discover Our Story <span>↗</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}