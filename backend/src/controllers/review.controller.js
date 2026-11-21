// Review controllers.
// Public: list reviews for a car.
// Customer: create review (requires completed booking), list own, delete own.
// Admin: delete any review.
//
// Phase 7 addition: notifyReviewReceived after a review is created.

import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import recomputeCarRating from "../utils/reviewAggregator.js";
import { notifyReviewReceived } from "../utils/notify.js";

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { bookingId, rating, text } = req.body || {};

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required." });
    }
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You can only review your own bookings." });
    }
    if (booking.bookingStatus !== "completed") {
      return res
        .status(400)
        .json({ success: false, message: "You can only review completed bookings." });
    }

    // Duplicate check is also enforced by the unique index on booking.
    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this booking." });
    }

    const review = await Review.create({
      customer: req.user._id,
      car: booking.car,
      booking: booking._id,
      rating: numericRating,
      text: typeof text === "string" ? text.trim() : "",
    });

    await recomputeCarRating(booking.car);

    await notifyReviewReceived(review);

    return res.status(201).json({ success: true, message: "Review created.", review });
  } catch (e) {
    if (e.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this booking." });
    }
    next(e);
  }
}

// GET /api/reviews/car/:carId  (public)
export async function listReviewsForCar(req, res, next) {
  try {
    const { carId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ car: carId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("customer", "name profileImage"),
      Review.countDocuments({ car: carId }),
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      reviews,
    });
  } catch (e) {
    next(e);
  }
}

// GET /api/reviews/my
export async function listMyReviews(req, res, next) {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("car", "brand model year images category");
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (e) {
    next(e);
  }
}

// DELETE /api/reviews/:id  (owner or admin)
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    const isOwner = review.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "You can only delete your own review." });
    }

    const carId = review.car;
    await review.deleteOne();
    await recomputeCarRating(carId);

    return res.status(200).json({ success: true, message: "Review deleted." });
  } catch (e) {
    next(e);
  }
}