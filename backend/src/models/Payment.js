// Payment record — manually recorded for now (no Stripe yet).
// When a payment flips to "completed", the controller syncs the booking's
// paymentStatus to "paid". When refunded, to "refunded".

import mongoose from "mongoose";

export const PAYMENT_METHODS = ["card", "cash", "bank_transfer"];
export const PAYMENT_STATUSES = ["pending", "completed", "failed", "refunded"];

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative."],
    },
    method: {
      type: String,
      required: true,
      enum: { values: PAYMENT_METHODS, message: "Invalid payment method." },
    },
    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },
    note: {
      type: String,
      default: "",
      maxlength: [500, "Note too long."],
    },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1, createdAt: -1 });
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;