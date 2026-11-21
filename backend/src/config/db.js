// Mongoose connection module.
// - connectDB(): opens the connection, registers event listeners, fails loudly on error.
// - closeDB(): cleanly closes the connection (used on SIGINT/SIGTERM).
//
// No models are defined here — this file is purely connection lifecycle.

import mongoose from "mongoose";
import config from "./index.js";

// Reasonable defaults for Atlas. If the cluster is unreachable or the
// password is wrong, we fail within ~10s instead of hanging forever.
const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

export async function connectDB() {
  console.log("[db] Connecting to MongoDB...");

  // Register listeners once. Attach them before connect so we don't miss
  // the first "connected" event.
  mongoose.connection.on("connected", () => {
    const { host, name } = mongoose.connection;
    console.log(`[db] MongoDB connected: ${host} / ${name}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[db] MongoDB reconnected.");
  });

  try {
    await mongoose.connect(config.mongoUri, CONNECTION_OPTIONS);
  } catch (err) {
    console.error("[db] Initial MongoDB connection failed:", err.message);
    throw err; // server.js will catch this and exit(1)
  }
}

export async function closeDB() {
  try {
    await mongoose.connection.close();
    console.log("[db] MongoDB connection closed.");
  } catch (err) {
    console.error("[db] Error while closing MongoDB connection:", err.message);
  }
}