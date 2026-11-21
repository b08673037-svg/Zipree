// Wishlist entry — one document per (user, car) pair.
// Separate collection (not embedded on User) so it scales and can be aggregated.

import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates and make lookups fast.
wishlistSchema.index({ user: 1, car: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;