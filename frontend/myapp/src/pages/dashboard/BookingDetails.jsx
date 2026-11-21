import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDateTime } from "../../lib/format.js";
import "./BookingDetails.css";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useDocumentTitle("Booking Details");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.booking);
      } catch (err) {
        setError("Booking not found or access denied.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: "Customer cancelled via dashboard" });
      // Refresh data
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.booking);
    } catch (err) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p style={{ color: "var(--color-silver)" }}>Loading...</p>;
  if (error || !booking) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="zipree-booking-details"
    >
      <Link to="/dashboard/bookings" className="zipree-back-link">← Back to Bookings</Link>
      
      <div className="zipree-dash-header" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Booking {booking.bookingReference}</h1>
            <p>Created on {formatDateTime(booking.createdAt)}</p>
          </div>
          <span className={`zipree-status-badge status-${booking.bookingStatus}`}>
            {booking.bookingStatus}
          </span>
        </div>
      </div>

      <div className="zipree-booking-details__grid">
        {/* Vehicle Card */}
        <div className="zipree-booking-details__card zipree-booking-details__card--vehicle">
          <img src={booking.car.images[0]} alt={booking.car.model} />
          <div className="zipree-booking-details__vehicle-info">
            <span className="zipree-booking-details__label">Vehicle</span>
            <h2>{booking.car.brand} {booking.car.model}</h2>
            <p>{booking.car.year} • {booking.car.category}</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="zipree-booking-details__card">
          <h3 className="zipree-booking-details__section-title">Reservation Details</h3>
          <div className="zipree-booking-details__row">
            <span>Pickup Location</span>
            <p>{booking.pickupLocation}</p>
          </div>
          <div className="zipree-booking-details__row">
            <span>Return Location</span>
            <p>{booking.returnLocation}</p>
          </div>
          <div className="zipree-booking-details__row">
            <span>Pickup Date</span>
            <p>{formatDateTime(booking.pickupDateTime)}</p>
          </div>
          <div className="zipree-booking-details__row">
            <span>Return Date</span>
            <p>{formatDateTime(booking.returnDateTime)}</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="zipree-booking-details__card zipree-booking-details__pricing">
        <h3 className="zipree-booking-details__section-title">Price Breakdown</h3>
        <div className="zipree-booking-details__row">
          <span>Daily Rate × {booking.priceSnapshot.days} days</span>
          <p>{formatCurrency(booking.priceSnapshot.baseSubtotal)}</p>
        </div>
        {booking.priceSnapshot.extras.map((extra, i) => (
          <div key={i} className="zipree-booking-details__row">
            <span>{extra.name}</span>
            <p>{formatCurrency(extra.lineTotal)}</p>
          </div>
        ))}
        <div className="zipree-booking-details__row">
          <span>Taxes</span>
          <p>{formatCurrency(booking.priceSnapshot.taxes)}</p>
        </div>
        <div className="zipree-booking-details__row zipree-booking-details__row--total">
          <span>Total</span>
          <p>{formatCurrency(booking.priceSnapshot.total)}</p>
        </div>
        <div className="zipree-booking-details__row">
          <span>Payment Status</span>
          <p style={{ textTransform: "capitalize" }}>{booking.paymentStatus}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="zipree-booking-details__actions">
        {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
          <button 
            onClick={handleCancel} 
            disabled={cancelling} 
            className="zipree-btn-danger"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
        <Link to="/contact" className="zipree-btn-secondary">Contact Support</Link>
      </div>

    </motion.div>
  );
}