import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./VehicleCategories.css";

const categories = [
  {
    id: "suv",
    label: "SUVs",
    desc: "Command the road with presence.",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop",
    size: "large",
  },
  {
    id: "luxury",
    label: "Luxury",
    desc: "The flagship of refined travel.",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop",
    size: "large",
  },
  {
    id: "sports",
    label: "Sports",
    desc: "Every exit, a grand entrance.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
    size: "small",
  },
  {
    id: "electric",
    label: "Electric",
    desc: "Silent speed. Zero compromise.",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop",
    size: "small",
  },
  {
    id: "sedan",
    label: "Sedans",
    desc: "Refined comfort for the long road.",
    image: "https://images.unsplash.com/photo-1781440312665-1d0704995f0d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    size: "small",
  },
  {
    id: "economy",
    label: "Economy",
    desc: "Smart, efficient, everyday.",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
    size: "small",
  },
];

export default function VehicleCategories() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="zipree-categories">
      <div className="zipree-categories__container">
        
        {/* Header */}
        <motion.div 
          className="zipree-categories__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.p variants={itemVariants} className="zipree-categories__eyebrow">
            Find Your Perfect Drive
          </motion.p>
          <motion.h2 variants={itemVariants} className="zipree-categories__title">
            A Vehicle for Every Journey.
          </motion.h2>
          <motion.p variants={itemVariants} className="zipree-categories__desc">
            From everyday comfort to extraordinary performance, discover the vehicle that matches your journey.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="zipree-categories__grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {categories.map((cat) => (
            <motion.div 
              key={cat.id} 
              variants={itemVariants}
              className={`zipree-category-card zipree-category-card--${cat.size}`}
            >
              <Link to={`/fleet?category=${cat.id}`} className="zipree-category-card__link">
                <div className="zipree-category-card__image-wrap">
                  <img 
                    src={cat.image} 
                    alt={`${cat.label} vehicles`} 
                    className="zipree-category-card__image"
                    loading="lazy"
                  />
                  <div className="zipree-category-card__overlay" />
                </div>
                
                <div className="zipree-category-card__content">
                  <div>
                    <h3 className="zipree-category-card__label">{cat.label}</h3>
                    <p className="zipree-category-card__desc">{cat.desc}</p>
                  </div>
                  <div className="zipree-category-card__arrow">
                    <span>Explore</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}