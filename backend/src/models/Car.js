// Car schema — the fleet.
// Every field from the project spec (Section 5), with enums to prevent typos,
// indexes for the queries we'll run in the Fleet listing page and admin dashboard.
// Phase 6 addition: ratingAverage and ratingCount (denormalized from Review aggregation).

import mongoose from "mongoose";

export const CAR_CATEGORIES = [
  "economy",
  "sedan",
  "suv",
  "sports",
  "luxury",
  "electric",
];

export const TRANSMISSIONS = ["automatic", "manual"];
export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"];

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required."],
      trim: true,
      maxlength: [40, "Brand must be at most 40 characters."],
    },
    model: {
      type: String,
      required: [true, "Model is required."],
      trim: true,
      maxlength: [60, "Model must be at most 60 characters."],
    },
    year: {
      type: Number,
      required: [true, "Year is required."],
      min: [1990, "Year must be 1990 or later."],
      max: [2100, "Year must be 2100 or earlier."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: { values: CAR_CATEGORIES, message: "Invalid category." },
    },
    images: {
      type: [String],
      default: [],
    },
    dailyPrice: {
      type: Number,
      required: [true, "Daily price is required."],
      min: [0, "Daily price cannot be negative."],
    },
    transmission: {
      type: String,
      required: [true, "Transmission is required."],
      enum: { values: TRANSMISSIONS, message: "Invalid transmission." },
    },
    fuel: {
      type: String,
      required: [true, "Fuel type is required."],
      enum: { values: FUEL_TYPES, message: "Invalid fuel type." },
    },
    seating: {
      type: Number,
      required: [true, "Seating capacity is required."],
      min: [1, "Seating must be at least 1."],
      max: [12, "Seating must be at most 12."],
    },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description must be at most 2000 characters."],
    },
    features: {
      type: [String],
      default: [],
    },
    pickupLocations: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ---- Indexes ----
// Single-field indexes for the most common filters.
carSchema.index({ category: 1 });
carSchema.index({ dailyPrice: 1 });
carSchema.index({ isActive: 1 });
carSchema.index({ isFeatured: 1 });
// Compound index: "featured active cars" is the homepage's primary query.
carSchema.index({ isActive: 1, isFeatured: 1 });
// Text index for future search on brand/model/description.
carSchema.index({ brand: "text", model: "text", description: "text" });

const Car = mongoose.model("Car", carSchema);

export default Car;