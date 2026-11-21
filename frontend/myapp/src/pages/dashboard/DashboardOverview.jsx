import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatDate } from "../../lib/format.js";
import "./DashboardOverview.css";

export default function DashboardOverview() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, wishlistRes] = await Promise.all([
          api.get("/bookings/my"),
          api.get("/wishlist")
        ]);
        setBookings(bookingsRes.bookings);
        setWishlist(wishlistRes.items);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const upcomingBookings = bookings.filter(b => b.bookingStatus === "pending" || b.bookingStatus === "confirmed");
  const nextBooking = upcomingBookings[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="zipree-dash-header">
        <h1>Welcome back, {user?.name?.split(" ")[0]}.</h1>
        <p>Here is an overview of your ZIPREE experience.</p>
      </div>

      <div className="zipree-dash-stats">
        <div className="zipree-stat-card">
          <span className="zipree-stat-card__label">Total Bookings</span>
          <span className="zipree-stat-card__value">{bookings.length}</span>
        </div>
        <div className="zipree-stat-card">
          <span className="zipree-stat-card__label">Upcoming Drives</span>
          <span className="zipree-stat-card__value">{upcomingBookings.length}</span>
        </div>
        <div className="zipree-stat-card">
          <span className="zipree-stat-card__label">Saved Vehicles</span>
          <span className="zipree-stat-card__value">{wishlist.length}</span>
        </div>
      </div>

      {nextBooking ? (
        <div className="zipree-dash-next">
          <div className="zipree-dash-next__content">
            <span className="zipree-dash-next__eyebrow">Next Up</span>
            <h2>Your {nextBooking.car.brand} {nextBooking.car.model}</h2>
            <p className="zipree-dash-next__ref">Ref: {nextBooking.bookingReference}</p>
            <div className="zipree-dash-next__dates">
              <div>
                <span>Pickup</span>
                <p>{formatDate(nextBooking.pickupDateTime)}</p>
              </div>
              <div>
                <span>Return</span>
                <p>{formatDate(nextBooking.returnDateTime)}</p>
              </div>
            </div>
            <Link to={`/dashboard/bookings/${nextBooking._id}`} className="zipree-dash-btn">
              View Booking Details
            </Link>
          </div>
          <div className="zipree-dash-next__image">
            <img src={nextBooking.car.images[0]} alt={nextBooking.car.model} />
          </div>
        </div>
      ) : (
        <div className="zipree-dash-empty">
          <h3>No upcoming reservations</h3>
          <p>Ready for your next journey?</p>
          <Link to="/fleet" className="zipree-dash-btn">Explore the Fleet</Link>
        </div>
      )}
    </motion.div>
  );
}