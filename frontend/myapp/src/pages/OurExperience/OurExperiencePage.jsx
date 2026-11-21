
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./OurExperiencePage.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=85&w=2000&auto=format&fit=crop";

const PHILOSOPHY_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=85&w=1200&auto=format&fit=crop";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=85&w=1200&auto=format&fit=crop";

function handleImageError(event) {
  const image = event.currentTarget;

  // Try the fallback image only once.
  if (image.dataset.fallbackApplied !== "true") {
    image.dataset.fallbackApplied = "true";
    image.src = FALLBACK_IMAGE;
  } else {
    image.style.visibility = "hidden";
  }
}

export default function OurExperiencePage() {
  useDocumentTitle("Our Experience");

  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const revealTransition = {
    duration: 1,
    ease: [0.16, 1, 0.3, 1],
  };

  return (
    <main className="zipree-exp-page">

      {/* =========================================
          SECTION 01: CINEMATIC HERO
      ========================================= */}
      <section className="zipree-exp-hero">

        <div className="zipree-exp-hero__bg">
          <img
            src={HERO_IMAGE}
            alt="Luxury Mercedes on the road"
            onError={handleImageError}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          <div className="zipree-exp-hero__overlay" />
        </div>

        <div className="zipree-exp-hero__content">

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="zipree-exp-hero__eyebrow"
          >
            The ZIPREE Experience
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="zipree-exp-hero__title"
          >
            Every Journey Deserves
            <br />
            <span className="zipree-exp-hero__title-gold">
              Something Extraordinary.
            </span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="zipree-exp-hero__desc"
          >
            Discover a more refined way to experience the road with ZIPREE.
            From carefully selected vehicles to a seamless reservation
            journey, every detail is designed around your drive.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link to="/fleet" className="zipree-exp-hero__cta">
              Explore Our Fleet
            </Link>
          </motion.div>

        </div>
      </section>

      {/* =========================================
          SECTION 02: THE PHILOSOPHY
      ========================================= */}
      <section className="zipree-exp-philosophy">

        <div className="zipree-exp-philosophy__container">

          {/* SIDE IMAGE */}
          <motion.div
            className="zipree-exp-philosophy__image-wrap"
            initial={
              reduce ? false : { opacity: 0, y: 35 }
            }
            whileInView={
              reduce ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.2 }}
            transition={revealTransition}
          >
            <img
              src={PHILOSOPHY_IMAGE}
              alt="Premium luxury automobile"
              className="zipree-exp-philosophy__image"
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          {/* TEXT CONTENT */}
          <motion.div
            className="zipree-exp-philosophy__content"
            initial={reduce ? false : "hidden"}
            whileInView={reduce ? undefined : "visible"}
            viewport={{ once: true, amount: 0.2 }}
            variants={
              reduce
                ? {}
                : {
                    visible: {
                      transition: {
                        staggerChildren: 0.15,
                      },
                    },
                  }
            }
          >
            <motion.div
              variants={reduce ? {} : fadeUp}
              className="zipree-exp-philosophy__divider"
            />

            <motion.h2
              variants={reduce ? {} : fadeUp}
              className="zipree-exp-philosophy__title"
            >
              It's Not Just About
              <br />
              the Destination.
            </motion.h2>

            <motion.p
              variants={reduce ? {} : fadeUp}
              className="zipree-exp-philosophy__desc"
            >
              We believe that the journey itself should be as memorable as
              the destination. That is why we have built a platform that
              prioritizes clarity, confidence, and a carefully curated
              selection of vehicles.
            </motion.p>

            <motion.p
              variants={reduce ? {} : fadeUp}
              className="zipree-exp-philosophy__desc"
            >
              From the moment you begin exploring our fleet to the moment
              you take the wheel, every step is designed to feel effortless
              and refined.
            </motion.p>

          </motion.div>

        </div>
      </section>

    </main>
  );
}
