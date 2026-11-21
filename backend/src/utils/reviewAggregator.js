// Recomputes a car's ratingAverage and ratingCount from its reviews.
// Called after review create/delete so the Car document stays accurate.
// One DB round-trip: aggregate + update.

import Review from "../models/Review.js";
import Car from "../models/Car.js";

export default async function recomputeCarRating(carId) {
  const stats = await Review.aggregate([
    { $match: { car: carId } },
    {
      $group: {
        _id: "$car",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  const roundedAvg = Math.round(avg * 10) / 10; // 1 decimal place

  await Car.updateOne(
    { _id: carId },
    { $set: { ratingAverage: roundedAvg, ratingCount: count } }
  );

  return { ratingAverage: roundedAvg, ratingCount: count };
}