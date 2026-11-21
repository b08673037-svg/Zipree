// One-time CLI: promote an existing user to admin.
// Usage (from backend/ folder):
//   node scripts/seedAdmin.js bilal@test.com
//
// Why a script and not an endpoint? Because granting admin power should never
// be possible through a public API. This runs locally, on demand, by the operator.

import mongoose from "mongoose";
import config from "../src/config/index.js";
import User from "../src/models/User.js";
import { connectDB, closeDB } from "../src/config/db.js";

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/seedAdmin.js <email>");
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
    } else if (user.role === "admin") {
      console.log(`User ${email} is already an admin.`);
    } else {
      user.role = "admin";
      await user.save();
      console.log(`Promoted ${email} to admin.`);
    }
  } catch (err) {
    console.error("Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
    await mongoose.disconnect().catch(() => {});
    process.exit();
  }
}

run();