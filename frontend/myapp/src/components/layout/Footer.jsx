import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import Logo from "../brand/Logo.jsx";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./Footer.css";

export default function Footer() {
  const reduce = useReducedMotion();
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <footer className="zipree-footer">
      <div className="zipree-footer__container">
        
        {/* Massive Signature Text */}
        <div className="zipree-footer__signature-wrap">
          <motion.h2 
            className="zipree-footer__signature"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            DRIVE <span className="zipree-footer__signature-gold">DIFFERENT.</span>
          </motion.h2>
        </div>

        {/* Main Footer Grid */}
        <motion.div 
          className="zipree-footer__grid"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={reduce ? {} : containerVariants}
        >
          {/* Column 1: Brand */}
          <motion.div variants={reduce ? {} : itemVariants} className="zipree-footer__col zipree-footer__col--brand">
            <Link to="/" className="zipree-footer__logo">
              <Logo />
            </Link>
            <p className="zipree-footer__statement">THE ART OF THE DRIVE.</p>
            <p className="zipree-footer__desc">
              Exceptional vehicles. Unforgettable journeys. A more refined way to move.
            </p>
            <div className="zipree-footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </motion.div>

          {/* Column 2: Explore */}
          <motion.div variants={reduce ? {} : itemVariants} className="zipree-footer__col">
            <h3 className="zipree-footer__heading">Explore</h3>
            <ul className="zipree-footer__links">
              <li><Link to="/fleet">Our Fleet</Link></li>
              <li><Link to="/fleet?category=luxury">Luxury Collection</Link></li>
              <li><Link to="/#how-it-works">How It Works</Link></li>
              <li><Link to="/#why-zipree">Why ZIPREE</Link></li>
            </ul>
          </motion.div>

          {/* Column 3: Quick Links */}
          <motion.div variants={reduce ? {} : itemVariants} className="zipree-footer__col">
            <h3 className="zipree-footer__heading">Quick Links</h3>
            <ul className="zipree-footer__links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/contact">FAQs</Link></li>
              <li><Link to="/dashboard/bookings">My Bookings</Link></li>
            </ul>
          </motion.div>

          {/* Column 4: Support */}
          <motion.div variants={reduce ? {} : itemVariants} className="zipree-footer__col">
            <h3 className="zipree-footer__heading">Support</h3>
            <ul className="zipree-footer__links">
              <li><Link to="/contact">Help Center</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="zipree-footer__bottom">
          <p className="zipree-footer__copyright">
            © {currentYear} ZIPREE. All rights reserved.
          </p>
          <div className="zipree-footer__legal">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}