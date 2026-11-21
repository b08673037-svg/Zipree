// One-time maintenance script.
// Recomputes ratingAverage and ratingCount for every car in the DB
// from the current Review collection. Safe to re-run any time.
//
// Usage:
//   node scripts/backfillRatings.js

import mongoose from "mongoose";
import { connectDB, closeDB } from "../src/config/db.js";
import Car from "../src/models/Car.js";
import Review from "../src/models/Review.js";

async function run() {
  try {
    await connectDB();

    const cars = await Car.find({}).select("_id");
    console.log(`Backfilling ratings for ${cars.length} cars...`);

    for (const car of cars) {
      const stats = await Review.aggregate([
        { $match: { car: car._id } },
        { $group: { _id: "$car", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      const { avg = 0, count = 0 } = stats[0] || {};
      const ratingAverage = Math.round(avg * 10) / 10;
      await Car.updateOne({ _id: car._id }, { $set: { ratingAverage, ratingCount: count } });
      console.log(`  ${car._id}: avg=${ratingAverage}, count=${count}`);
    }

    console.log("Done.");
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
    await mongoose.disconnect().catch(() => {});
    process.exit();
  }
}

run();