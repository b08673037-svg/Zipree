import { motion } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import "./WhyZipree.css";

const BENEFITS = [
  {
    number: "01",
    title: "Drive What Inspires You.",
    desc: "Explore a carefully selected collection of vehicles, from refined everyday comfort to extraordinary driving experiences.",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    number: "02",
    title: "Your Journey, Without the Hassle.",
    desc: "Discover your vehicle, choose your dates, and manage your reservation through a straightforward booking experience.",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    number: "03",
    title: "Clarity at Every Step.",
    desc: "Make informed rental decisions with clear vehicle information, straightforward pricing details, and an easy-to-understand reservation process.",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    number: "04",
    title: "Here When You Need Us.",
    desc: "Get assistance when you need help with your reservation, vehicle information, or rental experience.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function WhyZipree() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="zipree-why">
      <div className="zipree-why__container">
        
        {/* Header */}
        <motion.div 
          className="zipree-why__header"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={reduce ? {} : containerVariants}
        >
          <motion.p variants={reduce ? {} : itemVariants} className="zipree-why__eyebrow">
            The ZIPREE Difference
          </motion.p>
          <motion.h2 variants={reduce ? {} : itemVariants} className="zipree-why__title">
            More Than a Rental.<br />
            <span className="zipree-why__title-gold">A Better Way to Drive.</span>
          </motion.h2>
        </motion.div>

        {/* Benefits List */}
        <div className="zipree-why__list">
          {BENEFITS.map((benefit, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={benefit.number} 
                className={`zipree-why__item ${isEven ? "is-even" : "is-odd"}`}
                initial={reduce ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={reduce ? {} : itemVariants}
              >
                {/* Image Side */}
                <div className="zipree-why__image-wrap">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title} 
                    className="zipree-why__image"
                    loading="lazy"
                  />
                  <div className="zipree-why__number">{benefit.number}</div>
                </div>

                {/* Text Side */}
                <div className="zipree-why__content">
                  <h3 className="zipree-why__item-title">{benefit.title}</h3>
                  <p className="zipree-why__item-desc">{benefit.desc}</p>
                  <div className="zipree-why__divider" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}