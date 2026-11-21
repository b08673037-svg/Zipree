// Notification helpers — explicit function calls, no event bus.
// Each function creates notification documents for the right recipients.
// Failures are logged but never thrown, so a notification error can never
// break a booking/payment/review that otherwise succeeded.

import Notification from "../models/Notification.js";
import User from "../models/User.js";

async function safeCreateMany(docs) {
  try {
    if (docs.length === 0) return;
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error("[notify] Failed to create notifications:", err.message);
  }
}

async function getAdminIds() {
  const admins = await User.find({ role: "admin" }).select("_id");
  return admins.map((a) => a._id);
}

// ---- Booking created ----
export async function notifyBookingCreated(booking) {
  const adminIds = await getAdminIds();
  const docs = [
    {
      user: booking.customer,
      type: "booking_created",
      title: "Booking received",
      message: `Your booking ${booking.bookingReference} is pending confirmation.`,
      relatedTo: { kind: "booking", id: booking._id },
    },
    ...adminIds.map((adminId) => ({
      user: adminId,
      type: "booking_created",
      title: "New booking",
      message: `Booking ${booking.bookingReference} created.`,
      relatedTo: { kind: "booking", id: booking._id },
    })),
  ];
  await safeCreateMany(docs);
}

// ---- Booking status changed (by admin) ----
export async function notifyBookingStatusChanged(booking, newStatus) {
  const typeMap = {
    confirmed: "booking_confirmed",
    cancelled: "booking_cancelled",
    completed: "booking_completed",
  };
  const type = typeMap[newStatus];
  if (!type) return;

  const titleMap = {
    booking_confirmed: "Booking confirmed",
    booking_cancelled: "Booking cancelled",
    booking_completed: "Booking completed",
  };

  await safeCreateMany([
    {
      user: booking.customer,
      type,
      title: titleMap[type],
      message: `Booking ${booking.bookingReference} is now ${newStatus}.`,
      relatedTo: { kind: "booking", id: booking._id },
    },
  ]);
}

// ---- Payment completed or refunded ----
export async function notifyPaymentUpdate(payment, newStatus) {
  if (!["completed", "refunded", "failed"].includes(newStatus)) return;
  const titles = {
    completed: "Payment received",
    refunded: "Payment refunded",
    failed: "Payment failed",
  };
  await safeCreateMany([
    {
      user: payment.customer,
      type: "payment_received",
      title: titles[newStatus],
      message: `A payment of ${payment.amount} was ${newStatus}.`,
      relatedTo: { kind: "payment", id: payment._id },
    },
  ]);
}

// ---- Review posted ----
export async function notifyReviewReceived(review) {
  const adminIds = await getAdminIds();
  await safeCreateMany(
    adminIds.map((adminId) => ({
      user: adminId,
      type: "review_received",
      title: "New review",
      message: `A new review (${review.rating}★) was posted.`,
      relatedTo: { kind: "review", id: review._id },
    }))
  );
}