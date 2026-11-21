// Notification schema — in-app inbox only.
// One document per recipient. Admins get their own copies (separate from customers).
// Real-time/email/SMS is a later phase; this is the persistent store the frontend polls.

import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "booking_created",
  "booking_confirmed",
  "booking_cancelled",
  "booking_completed",
  "payment_received",
  "review_received",
  "system",
];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPES, message: "Invalid notification type." },
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "Title too long."],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Message too long."],
    },
    relatedTo: {
      kind: {
        type: String,
        enum: ["booking", "car", "payment", "review", null],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast: unread-first listing per user, unread count per user.
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;