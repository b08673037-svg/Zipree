// Booking schema.
// - priceSnapshot is frozen at creation. Changing the car's dailyPrice later
//   does NOT alter past bookings.
// - bookingStatus and paymentStatus are deliberately separate.
// - Cancelled bookings still exist (for history) but are excluded from the
//   availability overlap query in the controller.

import mongoose from "mongoose";

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"];

// Statuses that BLOCK availability. Deliberately excludes "cancelled" and "completed".
export const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    pickupLocation: { type: String, required: true, trim: true },
    returnLocation: { type: String, required: true, trim: true },
    pickupDateTime: { type: Date, required: true },
    returnDateTime: { type: Date, required: true },
    rentalDays: { type: Number, required: true, min: 1 },

    priceSnapshot: {
      dailyPrice: { type: Number, required: true },
      days: { type: Number, required: true },
      baseSubtotal: { type: Number, required: true },
      extras: [
        {
          name: String,
          pricePerDay: Number,
          lineTotal: Number,
        },
      ],
      subtotal: { type: Number, required: true },
      taxes: { type: Number, required: true },
      total: { type: Number, required: true },
      taxRate: { type: Number, required: true },
      currency: { type: String, default: "USD" },
    },

    total: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "unpaid",
    },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
    },

    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// ---- Indexes ----
// Critical for the overlap query:
// find bookings for a car where status blocks AND interval overlaps.
bookingSchema.index({
  car: 1,
  bookingStatus: 1,
  pickupDateTime: 1,
  returnDateTime: 1,
});
// Customer's bookings, newest first.
bookingSchema.index({ customer: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;