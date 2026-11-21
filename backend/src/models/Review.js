// Review schema.
// One review per completed booking (not per customer per car).
// The DB enforces uniqueness on `booking` so a customer can't double-review
// the same rental. Rating is 1–5. Text is optional.

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // one review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating must be at most 5."],
    },
    text: {
      type: String,
      default: "",
      maxlength: [1000, "Review text must be at most 1000 characters."],
      trim: true,
    },
  },
  { timestamps: true }
);

// Fast lookups: reviews per car, reviews per customer.
reviewSchema.index({ car: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;