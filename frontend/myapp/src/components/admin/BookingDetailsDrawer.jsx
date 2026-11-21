import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiXCircle, FiTruck, FiUser, FiMapPin, FiCalendar } from "react-icons/fi";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDateTime } from "../../lib/format.js";
import "./BookingDetailsDrawer.css";

export default function BookingDetailsDrawer({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  if (!booking) return null;

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/bookings/${booking._id}/status`, { 
        status: newStatus,
        reason: newStatus === "cancelled" ? "Cancelled by admin" : undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    if (booking.bookingStatus === "pending") {
      actions.push({ label: "Confirm Booking", status: "confirmed", type: "confirm" });
      actions.push({ label: "Cancel Booking", status: "cancelled", type: "cancel" });
    } else if (booking.bookingStatus === "confirmed") {
      actions.push({ label: "Mark as Active (Pickup)", status: "active", type: "confirm" });
      actions.push({ label: "Cancel Booking", status: "cancelled", type: "cancel" });
    } else if (booking.bookingStatus === "active") {
      actions.push({ label: "Complete Rental (Return)", status: "completed", type: "confirm" });
    }
    return actions;
  };

  const actions = getAvailableActions();

  return (
    <AnimatePresence>
      <motion.div 
        className="zipree-drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="zipree-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="zipree-drawer__header">
            <div>
              <p className="zipree-drawer__eyebrow">Booking Details</p>
              <h2 className="zipree-drawer__title">{booking.bookingReference}</h2>
            </div>
            <button onClick={onClose} className="zipree-drawer__close-btn" aria-label="Close">
              <FiX />
            </button>
          </div>

          {/* Content */}
          <div className="zipree-drawer__content">
            {error && <div className="zipree-drawer__error">{error}</div>}

            {/* Status Summary */}
            <div className="zipree-drawer__status-row">
              <span className={`zipree-booking-badge zipree-booking-badge--${booking.bookingStatus}`}>
                {booking.bookingStatus}
              </span>
              <span className={`zipree-booking-badge zipree-booking-badge--payment-${booking.paymentStatus}`}>
                {booking.paymentStatus}
              </span>
            </div>

            {/* Customer */}
            <div className="zipree-drawer__section">
              <h3 className="zipree-drawer__section-title"><FiUser /> Customer</h3>
              <div className="zipree-drawer__info">
                <p className="zipree-drawer__info-value">{booking.customer?.name || "Unknown"}</p>
                <p className="zipree-drawer__info-sub">{booking.customer?.email || ""}</p>
                {booking.customer?.phone && <p className="zipree-drawer__info-sub">{booking.customer.phone}</p>}
              </div>
            </div>

            {/* Vehicle */}
            <div className="zipree-drawer__section">
              <h3 className="zipree-drawer__section-title"><FiTruck /> Vehicle</h3>
              <div className="zipree-drawer__vehicle-card">
                <img src={booking.car?.images?.[0]} alt={booking.car?.model} />
                <div>
                  <p className="zipree-drawer__info-value">{booking.car?.brand} {booking.car?.model}</p>
                  <p className="zipree-drawer__info-sub">{booking.car?.year} • {booking.car?.category}</p>
                  <p className="zipree-drawer__info-sub">{formatCurrency(booking.car?.dailyPrice)}/day</p>
                </div>
              </div>
            </div>

            {/* Rental Info */}
            <div className="zipree-drawer__section">
              <h3 className="zipree-drawer__section-title"><FiCalendar /> Rental Period</h3>
              <div className="zipree-drawer__grid-2">
                <div>
                  <p className="zipree-drawer__label">Pickup</p>
                  <p className="zipree-drawer__value">{formatDateTime(booking.pickupDateTime)}</p>
                  <p className="zipree-drawer__info-sub"><FiMapPin /> {booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="zipree-drawer__label">Return</p>
                  <p className="zipree-drawer__value">{formatDateTime(booking.returnDateTime)}</p>
                  <p className="zipree-drawer__info-sub"><FiMapPin /> {booking.returnLocation}</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="zipree-drawer__section">
              <h3 className="zipree-drawer__section-title">Price Breakdown</h3>
              <div className="zipree-drawer__price-row">
                <span>Base ({booking.priceSnapshot?.days} days)</span>
                <span>{formatCurrency(booking.priceSnapshot?.baseSubtotal)}</span>
              </div>
              {booking.priceSnapshot?.extras?.map((extra, i) => (
                <div key={i} className="zipree-drawer__price-row">
                  <span>{extra.name}</span>
                  <span>{formatCurrency(extra.lineTotal)}</span>
                </div>
              ))}
              <div className="zipree-drawer__price-row">
                <span>Taxes</span>
                <span>{formatCurrency(booking.priceSnapshot?.taxes)}</span>
              </div>
              <div className="zipree-drawer__price-total">
                <span>Total</span>
                <span>{formatCurrency(booking.total)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="zipree-drawer__section">
              <h3 className="zipree-drawer__section-title">Timeline</h3>
              <div className="zipree-drawer__timeline">
                <div className="zipree-drawer__timeline-item is-done">
                  <span className="zipree-drawer__timeline-dot" />
                  <div>
                    <p className="zipree-drawer__timeline-label">Reservation Created</p>
                    <p className="zipree-drawer__timeline-date">{formatDateTime(booking.createdAt)}</p>
                  </div>
                </div>
                {booking.bookingStatus !== "pending" && booking.bookingStatus !== "cancelled" && (
                  <div className="zipree-drawer__timeline-item is-done">
                    <span className="zipree-drawer__timeline-dot" />
                    <div>
                      <p className="zipree-drawer__timeline-label">Confirmed</p>
                    </div>
                  </div>
                )}
                {(booking.bookingStatus === "active" || booking.bookingStatus === "completed") && (
                  <div className="zipree-drawer__timeline-item is-done">
                    <span className="zipree-drawer__timeline-dot" />
                    <div>
                      <p className="zipree-drawer__timeline-label">Vehicle Picked Up</p>
                    </div>
                  </div>
                )}
                {booking.bookingStatus === "completed" && (
                  <div className="zipree-drawer__timeline-item is-done">
                    <span className="zipree-drawer__timeline-dot" />
                    <div>
                      <p className="zipree-drawer__timeline-label">Rental Completed</p>
                    </div>
                  </div>
                )}
                {booking.bookingStatus === "cancelled" && (
                  <div className="zipree-drawer__timeline-item is-cancelled">
                    <span className="zipree-drawer__timeline-dot" />
                    <div>
                      <p className="zipree-drawer__timeline-label">Cancelled</p>
                      <p className="zipree-drawer__timeline-date">{formatDateTime(booking.cancelledAt)}</p>
                      {booking.cancellationReason && <p className="zipree-drawer__info-sub">{booking.cancellationReason}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          {actions.length > 0 && (
            <div className="zipree-drawer__footer">
              {confirmAction ? (
                <div className="zipree-drawer__confirm">
                  <p>Are you sure you want to {confirmAction.label.toLowerCase()}?</p>
                  <div className="zipree-drawer__confirm-actions">
                    <button 
                      onClick={() => setConfirmAction(null)} 
                      className="zipree-drawer__btn zipree-drawer__btn--secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(confirmAction.status)} 
                      className={`zipree-drawer__btn ${confirmAction.type === "cancel" ? "zipree-drawer__btn--danger" : "zipree-drawer__btn--primary"}`}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="zipree-drawer__actions">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setConfirmAction(action)}
                      className={`zipree-drawer__btn ${action.type === "cancel" ? "zipree-drawer__btn--danger" : "zipree-drawer__btn--primary"}`}
                    >
                      {action.type === "confirm" ? <FiCheck /> : <FiXCircle />} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}