// Booking routes.
// Public: availability check (so the frontend can show "Available" before login).
// Customer (authenticated): create, my, detail, cancel.
// Admin only: list all, set status, set payment status.

import { Router } from "express";
import {
  checkAvailability,
  createBooking,
  listMyBookings,
  getBooking,
  cancelBooking,
  listAllBookings,
  setBookingStatus,
  setPaymentStatus,
} from "../controllers/booking.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

// ---- Public ----
router.get("/availability/:carId", checkAvailability);

// ---- Customer (authenticated) ----
router.post("/", protect, createBooking);
router.get("/my", protect, listMyBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id/cancel", protect, cancelBooking);

// ---- Admin ----
router.get("/", protect, restrictTo("admin"), listAllBookings);
router.patch("/:id/status", protect, restrictTo("admin"), setBookingStatus);
router.patch("/:id/payment", protect, restrictTo("admin"), setPaymentStatus);

export default router;