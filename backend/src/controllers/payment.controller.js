// Payment controllers — admin-only recording of manual payments.
// Syncs the parent booking's paymentStatus when a payment is completed or refunded.
// Real gateway integration (Stripe) is a separate phase.
//
// Phase 7 additions: notifyPaymentUpdate on status change.

import Payment, { PAYMENT_METHODS, PAYMENT_STATUSES } from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { notifyPaymentUpdate } from "../utils/notify.js";

// POST /api/payments  (admin)
export async function createPayment(req, res, next) {
  try {
    const { bookingId, amount, method, transactionReference, status, note } = req.body || {};

    if (!bookingId || amount === undefined || !method) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId, amount, and method are required." });
    }
    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method." });
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ success: false, message: "Amount must be non-negative." });
    }
    const finalStatus = status || "pending";
    if (!PAYMENT_STATUSES.includes(finalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount: numericAmount,
      method,
      transactionReference: transactionReference || "",
      status: finalStatus,
      note: note || "",
    });

    // Sync booking paymentStatus.
    if (finalStatus === "completed") {
      booking.paymentStatus = "paid";
      await booking.save();
    } else if (finalStatus === "refunded") {
      booking.paymentStatus = "refunded";
      await booking.save();
    }

    await notifyPaymentUpdate(payment, finalStatus);

    return res.status(201).json({ success: true, message: "Payment recorded.", payment });
  } catch (e) {
    next(e);
  }
}

// PATCH /api/payments/:id/status  (admin)
export async function updatePaymentStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found." });

    payment.status = status;
    await payment.save();

    // Sync booking paymentStatus.
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      if (status === "completed") booking.paymentStatus = "paid";
      else if (status === "refunded") booking.paymentStatus = "refunded";
      else if (status === "failed") booking.paymentStatus = "failed";
      await booking.save();
    }

    await notifyPaymentUpdate(payment, status);

    return res.status(200).json({ success: true, message: "Payment updated.", payment });
  } catch (e) {
    next(e);
  }
}

// GET /api/payments/booking/:bookingId  (admin, or booking owner)
export async function getPaymentsForBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const isOwner = booking.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const payments = await Payment.find({ booking: booking._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (e) {
    next(e);
  }
}