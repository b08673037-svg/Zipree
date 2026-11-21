// Wishlist controllers.
// All endpoints require authentication. Each operates on the current user's wishlist only.

import Wishlist from "../models/Wishlist.js";
import Car from "../models/Car.js";

// POST /api/wishlist/:carId
export async function addToWishlist(req, res, next) {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });

    try {
      const item = await Wishlist.create({ user: req.user._id, car: car._id });
      return res.status(201).json({ success: true, message: "Added to wishlist.", item });
    } catch (e) {
      if (e.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Car is already in your wishlist." });
      }
      throw e;
    }
  } catch (e) {
    next(e);
  }
}

// DELETE /api/wishlist/:carId
export async function removeFromWishlist(req, res, next) {
  try {
    const { carId } = req.params;
    const removed = await Wishlist.findOneAndDelete({
      user: req.user._id,
      car: carId,
    });
    if (!removed) {
      return res.status(404).json({ success: false, message: "Not in your wishlist." });
    }
    return res.status(200).json({ success: true, message: "Removed from wishlist." });
  } catch (e) {
    next(e);
  }
}

// GET /api/wishlist
export async function getMyWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("car", "brand model year images category dailyPrice ratingAverage ratingCount isActive");

    // Filter out cars that were deleted after being wishlisted.
    const cleaned = items.filter((i) => i.car);

    return res.status(200).json({ success: true, count: cleaned.length, items: cleaned });
  } catch (e) {
    next(e);
  }
}