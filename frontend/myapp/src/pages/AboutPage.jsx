
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import useReducedMotion from "../hooks/useReducedMotion.js";
import "./AboutPage.css";

const CORE_VALUES = [
  {
    number: "01",
    title: "Excellence in Every Detail",
    desc: "We believe a premium experience is created through attention to the details that matter.",
  },
  {
    number: "02",
    title: "Transparency and Trust",
    desc: "We value clear information and honest communication throughout the rental journey.",
  },
  {
    number: "03",
    title: "Customer-First Thinking",
    desc: "We aim to make every interaction straightforward, thoughtful, and welcoming.",
  },
  {
    number: "04",
    title: "Passion for Automobiles",
    desc: "Our appreciation for automobiles inspires the way we present and develop our platform.",
  },
];

export default function AboutPage() {
  useDocumentTitle("About Us");
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

  return (
    <main className="zipree-about">

      {/* SECTION 01: CINEMATIC HERO */}
      <section className="zipree-about-hero">
        <div className="zipree-about-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury car studio"
          />
          <div className="zipree-about-hero__overlay" />
        </div>

        <div className="zipree-about-hero__content">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="zipree-about-hero__eyebrow"
          >
            Get to Know ZIPREE
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="zipree-about-hero__title"
          >
            Driven by Passion.<br />
            <span className="zipree-about-hero__title-gold">
              Defined by Excellence.
            </span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="zipree-about-hero__desc"
          >
            Discover the vision, values, and ambition behind ZIPREE — a more
            considered approach to the world of vehicle rentals.
          </motion.p>
        </div>
      </section>

      {/* SECTION 02: THE STORY */}
      <section className="zipree-about-story">
        <div className="zipree-about-story__container">

          <motion.div
            className="zipree-about-story__image-wrap"
            initial={reduce ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop"
              alt="Luxury car exterior"
              className="zipree-about-story__image"
            />
          </motion.div>

          <motion.div
            className="zipree-about-story__content"
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={
              reduce
                ? {}
                : {
                    visible: {
                      transition: { staggerChildren: 0.15 },
                    },
                  }
            }
          >
            <motion.div
              variants={reduce ? {} : fadeUp}
              className="zipree-about-story__divider"
            />

            <motion.h2
              variants={reduce ? {} : fadeUp}
              className="zipree-about-story__title"
            >
              A Vision Beyond<br />the Ordinary.
            </motion.h2>

            <motion.p
              variants={reduce ? {} : fadeUp}
              className="zipree-about-story__desc"
            >
              ZIPREE was born from a simple observation: the process of
              renting a premium vehicle was often anything but premium. We
              saw an opportunity to remove the friction, the ambiguity, and
              the ordinary, replacing them with clarity, confidence, and a
              curated selection of exceptional automobiles.
            </motion.p>

            <motion.p
              variants={reduce ? {} : fadeUp}
              className="zipree-about-story__desc"
            >
              We exist to make vehicle discovery and rental more accessible,
              transparent, and enjoyable. We are building a trusted
              automotive rental experience recognized for its quality,
              clarity, and customer-focused service.
            </motion.p>
          </motion.div>

        </div>
      </section>

      {/* SECTION 03: MISSION & VISION */}
      <section className="zipree-about-mission">
        <div className="zipree-about-mission__container">

          <motion.div
            className="zipree-about-mission__col"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="zipree-about-mission__label">
              Our Mission
            </h3>

            <p className="zipree-about-mission__text">
              To make vehicle discovery and rental more accessible,
              transparent, and enjoyable through a thoughtfully designed
              experience.
            </p>
          </motion.div>

          <div className="zipree-about-mission__divider" />

          <motion.div
            className="zipree-about-mission__col"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="zipree-about-mission__label">
              Our Vision
            </h3>

            <p className="zipree-about-mission__text">
              To build a trusted automotive rental experience recognized
              for quality, clarity, and customer-focused service.
            </p>
          </motion.div>

        </div>
      </section>

      {/* SECTION 04: CORE VALUES */}
      <section className="zipree-about-values">
        <div className="zipree-about-values__container">

          <motion.div
            className="zipree-about-values__header"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="zipree-about-values__title">
              The Principles That Drive Us.
            </h2>
          </motion.div>

          <div className="zipree-about-values__grid">
            {CORE_VALUES.map((value, index) => (
              <motion.div
                key={value.number}
                className={`zipree-about-values__item ${
                  index % 2 !== 0 ? "is-offset" : ""
                }`}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <div className="zipree-about-values__number">
                  {value.number}
                </div>

                <h4 className="zipree-about-values__item-title">
                  {value.title}
                </h4>

                <p className="zipree-about-values__item-desc">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 05: WHAT DEFINES ZIPREE */}
      <section className="zipree-about-define">
        <div className="zipree-about-define__bg" />

        <div className="zipree-about-define__container">
          <motion.h2
            className="zipree-about-define__title"
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            More Than a Name.<br />
            <span className="zipree-about-define__gold">
              A Standard.
            </span>
          </motion.h2>

          <motion.p
            className="zipree-about-define__desc"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            We are committed to improving the rental experience through
            thoughtfully presented vehicle selections, a clear and
            straightforward booking process, and a consistent premium
            visual identity.
          </motion.p>
        </div>
      </section>

      {/* SECTION 06: OUR COMMITMENT */}
      <section className="zipree-about-commitment">
        <div className="zipree-about-commitment__container">

          <motion.div
            className="zipree-about-commitment__content"
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={
              reduce
                ? {}
                : {
                    visible: {
                      transition: { staggerChildren: 0.15 },
                    },
                  }
            }
          >
            <motion.h2
              variants={reduce ? {} : fadeUp}
              className="zipree-about-commitment__title"
            >
              Your Confidence Matters.
            </motion.h2>

            <motion.p
              variants={reduce ? {} : fadeUp}
              className="zipree-about-commitment__desc"
            >
              We provide clear vehicle information, understandable
              reservation details, and a straightforward customer journey.
              From the moment you begin exploring our fleet to the moment
              you take the wheel, our communication is thoughtful and
              customer-focused.
            </motion.p>
          </motion.div>

          <motion.div
            className="zipree-about-commitment__image-wrap"
            initial={reduce ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop"
              alt="Customer receiving car keys"
              className="zipree-about-commitment__image"
            />
          </motion.div>

        </div>
      </section>

      {/* SECTION 07: ALTERNATIVE TEAM SECTION */}
      <section className="zipree-about-team">
        <div className="zipree-about-team__container">

          <motion.h2
            className="zipree-about-team__title"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Built Around a Better Driving Experience.
          </motion.h2>

          <motion.p
            className="zipree-about-team__desc"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            While our platform is digital, our passion is driven by the
            physical experience of the automobile. We are automotive
            enthusiasts, designers, and customer advocates united by a
            shared goal: to elevate the standard of vehicle rental.
          </motion.p>

        </div>
      </section>

      {/* SECTION 08: FINAL CTA */}
      <section className="zipree-about-cta">
        <div className="zipree-about-cta__bg">
          <img
            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2000&auto=format&fit=crop"
            alt="Open road"
          />
          <div className="zipree-about-cta__overlay" />
        </div>

        <motion.div
          className="zipree-about-cta__content"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="zipree-about-cta__title">
            The Road Ahead Starts With Us.
          </h2>

          <p className="zipree-about-cta__desc">
            Explore the ZIPREE fleet and discover a more refined way to
            experience your next journey.
          </p>

          <Link to="/fleet" className="zipree-about-cta__btn">
            Discover Our Fleet
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
