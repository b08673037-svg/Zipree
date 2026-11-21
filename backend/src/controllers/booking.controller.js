import mongoose from "mongoose";
import Booking, {
  BLOCKING_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
} from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import generateBookingReference from "../utils/bookingReference.js";
import { calculatePriceSnapshot, calculateRentalDays } from "../utils/pricing.js";
import { notifyBookingCreated, notifyBookingStatusChanged } from "../utils/notify.js";

// ---- Helpers ----

function parseExtras(input) {
  if (input === undefined) return [];
  if (!Array.isArray(input)) return null;
  const out = [];
  for (const e of input) {
    if (!e || typeof e !== "object") return null;
    if (typeof e.name !== "string" || !e.name.trim()) return null;
    const pricePerDay = Number(e.pricePerDay);
    if (Number.isNaN(pricePerDay) || pricePerDay < 0) return null;
    out.push({ name: e.name.trim(), pricePerDay });
  }
  return out;
}

async function findOverlappingBookings(carId, pickup, returnAt, { session } = {}) {
  return Booking.find({
    car: carId,
    bookingStatus: { $in: BLOCKING_STATUSES },
    pickupDateTime: { $lt: returnAt },
    returnDateTime: { $gt: pickup },
  }).session(session || null);
}

// ---- Public: availability ----

export async function checkAvailability(req, res, next) {
  try {
    const { carId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: "Query params 'from' and 'to' are required." });
    }
    const pickup = new Date(from);
    const returnAt = new Date(to);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnAt.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }
    if (returnAt <= pickup) {
      return res.status(400).json({ success: false, message: "Return date must be after pickup date." });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });
    if (!car.isActive) {
      return res.status(200).json({ success: true, available: false, reason: "Car is inactive." });
    }

    const overlaps = await findOverlappingBookings(carId, pickup, returnAt);
    const blockedRanges = overlaps.map((b) => ({ pickup: b.pickupDateTime, return: b.returnDateTime }));

    return res.status(200).json({ success: true, available: overlaps.length === 0, blockedRanges });
  } catch (e) {
    next(e);
  }
}

// ---- Customer: create ----

export async function createBooking(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { carId, pickupLocation, returnLocation, pickupDateTime, returnDateTime, extras: rawExtras } = req.body || {};

    if (!carId || !pickupLocation || !returnLocation || !pickupDateTime || !returnDateTime) {
      return res.status(400).json({ success: false, message: "Missing required booking fields." });
    }
    const pickup = new Date(pickupDateTime);
    const returnAt = new Date(returnDateTime);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnAt.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }
    if (returnAt <= pickup) {
      return res.status(400).json({ success: false, message: "Return date must be after pickup date." });
    }

    const extras = parseExtras(rawExtras);
    if (extras === null) {
      return res.status(400).json({ success: false, message: "Invalid extras format." });
    }

    let created = null;

    await session.withTransaction(async () => {
      const car = await Car.findById(carId).session(session);
      if (!car) {
        const err = new Error("Car not found.");
        err.statusCode = 404;
        throw err;
      }
      if (!car.isActive) {
        const err = new Error("Car is not available for booking.");
        err.statusCode = 400;
        throw err;
      }

      const overlap = await findOverlappingBookings(carId, pickup, returnAt, { session });
      if (overlap.length > 0) {
        const err = new Error("Car is not available for those dates.");
        err.statusCode = 409;
        throw err;
      }

      const priceSnapshot = calculatePriceSnapshot({ car, pickup, returnAt, extras });
      const rentalDays = calculateRentalDays(pickup, returnAt);

      let attempt = 0;
      let booking;
      while (attempt < 3) {
        try {
          const docs = await Booking.create(
            [{
              bookingReference: generateBookingReference(),
              customer: req.user._id,
              car: car._id,
              pickupLocation: String(pickupLocation).trim(),
              returnLocation: String(returnLocation).trim(),
              pickupDateTime: pickup,
              returnDateTime: returnAt,
              rentalDays,
              priceSnapshot,
              total: priceSnapshot.total,
              paymentStatus: "unpaid",
              bookingStatus: "pending",
            }],
            { session }
          );
          booking = docs[0];
          break;
        } catch (e) {
          if (e.code === 11000 && attempt < 2) { attempt++; continue; }
          throw e;
        }
      }

      if (!booking) throw new Error("Failed to create booking.");
      created = booking;
    });

    await notifyBookingCreated(created);

    return res.status(201).json({ success: true, message: "Booking created.", booking: created });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  } finally {
    await session.endSession();
  }
}

// ---- Customer: my bookings ----

export async function listMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("car", "brand model year images category dailyPrice");
    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (e) {
    next(e);
  }
}

// ---- Customer or admin: get one booking ----

export async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car", "brand model year images category dailyPrice")
      .populate("customer", "name email phone");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const isOwner = booking.customer && booking.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to view this booking." });
    }

    return res.status(200).json({ success: true, booking });
  } catch (e) {
    next(e);
  }
}

// ---- Customer: cancel own booking ----

export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const isOwner = booking.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled." });
    }
    if (booking.bookingStatus === "completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled." });
    }

    booking.bookingStatus = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = (req.body && req.body.reason) || "Customer cancelled";
    await booking.save();

    return res.status(200).json({ success: true, message: "Booking cancelled.", booking });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: list all ----

export async function listAllBookings(req, res, next) {
  try {
    const { status, paymentStatus, search, sort = "-createdAt", page = "1", limit = "20" } = req.query;

    const filter = {};
    if (status) filter.bookingStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search && search.trim()) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const [matchingUsers, matchingCars] = await Promise.all([
        User.find({ $or: [{ name: rx }, { email: rx }] }).select("_id"),
        Car.find({ $or: [{ brand: rx }, { model: rx }] }).select("_id"),
      ]);

      filter.$or = [
        { bookingReference: rx },
        { customer: { $in: matchingUsers.map((u) => u._id) } },
        { car: { $in: matchingCars.map((c) => c._id) } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("car", "brand model year images category dailyPrice")
        .populate("customer", "name email phone"),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      bookings,
    });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: set booking status ----

export async function setBookingStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid booking status." });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    booking.bookingStatus = status;
    if (status === "cancelled" && !booking.cancelledAt) {
      booking.cancelledAt = new Date();
      booking.cancellationReason = (req.body && req.body.reason) || "Cancelled by admin";
    }
    await booking.save();
    await notifyBookingStatusChanged(booking, status);
    return res.status(200).json({ success: true, message: "Booking status updated.", booking });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: set payment status ----

export async function setPaymentStatus(req, res, next) {
  try {
    const { status, method = "manual" } = req.body || {};
    if (!PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    // Update booking payment status
    booking.paymentStatus = status;

    // If marked as paid, auto-confirm the booking (optional but recommended)
    if (status === "paid" && booking.bookingStatus === "pending") {
      booking.bookingStatus = "confirmed";
    }

    await booking.save();

    // If marked as paid, create a Payment record (for revenue tracking) and notify the customer
    if (status === "paid") {
      // Check if a payment record already exists to avoid duplicates
      const existingPayment = await Payment.findOne({
        booking: booking._id,
        status: "completed",
      });

      if (!existingPayment) {
        await Payment.create({
          booking: booking._id,
          customer: booking.customer,
          amount: booking.total,
          method,
          transactionReference: `ADMIN-${Date.now()}`,
          status: "completed",
        });
      }

      // Notify the customer that payment was received
      const { notifyPaymentUpdate } = await import("../utils/notify.js");
      const paymentRecord = await Payment.findOne({
        booking: booking._id,
        status: "completed",
      });
      if (paymentRecord) {
        await notifyPaymentUpdate(paymentRecord, "completed");
      }
    }

    return res.status(200).json({ success: true, message: "Payment status updated.", booking });
  } catch (e) {
    next(e);
  }
}