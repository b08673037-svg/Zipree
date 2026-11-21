import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDate } from "../../lib/format.js";
import "./MyBookings.css";

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function MyBookings() {
  useDocumentTitle("My Bookings");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.bookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const filteredBookings = activeFilter === "All" 
    ? bookings 
    : bookings.filter(b => b.bookingStatus.toLowerCase() === activeFilter.toLowerCase());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="zipree-dash-header">
        <h1>My Bookings</h1>
        <p>Manage your reservations and review past journeys.</p>
      </div>

      {/* Filter Tabs */}
      <div className="zipree-mybookings-filters">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`zipree-mybookings-filter-btn ${activeFilter === filter ? "is-active" : ""}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {loading ? (
        <p style={{ color: "var(--color-silver)" }}>Loading your bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="zipree-dash-empty">
          <h3>No bookings found</h3>
          <p>You don't have any {activeFilter.toLowerCase()} reservations.</p>
          <Link to="/fleet" className="zipree-dash-btn">Explore the Fleet</Link>
        </div>
      ) : (
        <div className="zipree-mybookings-list">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="zipree-booking-row">
              <div className="zipree-booking-row__image">
                <img src={booking.car.images[0]} alt={booking.car.model} />
              </div>
              <div className="zipree-booking-row__content">
                <div className="zipree-booking-row__header">
                  <div>
                    <h3>{booking.car.brand} {booking.car.model}</h3>
                    <p className="zipree-booking-row__ref">Ref: {booking.bookingReference}</p>
                  </div>
                  <span className={`zipree-status-badge status-${booking.bookingStatus}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="zipree-booking-row__details">
                  <div>
                    <span>Pickup</span>
                    <p>{formatDate(booking.pickupDateTime)}</p>
                  </div>
                  <div>
                    <span>Return</span>
                    <p>{formatDate(booking.returnDateTime)}</p>
                  </div>
                  <div>
                    <span>Total</span>
                    <p>{formatCurrency(booking.total)}</p>
                  </div>
                </div>
              </div>
              <Link to={`/dashboard/bookings/${booking._id}`} className="zipree-booking-row__link">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}