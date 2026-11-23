import mongoose from "mongoose";
import config from "./index.js";

const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Vercel ke liye chhota pool rakhna zaroori hai
};

// Connection ko cache karne ke liye variable
let cachedConnection = null;

export async function connectDB() {
  // Agar pehle se connection hai aur ready state 1 (connected) hai, toh wahi use karo
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  console.log("[db] Connecting to MongoDB...");

  try {
    cachedConnection = await mongoose.connect(config.mongoUri, CONNECTION_OPTIONS);
    
    // Yeh logs sirf pehli baar connect hone par aayenge
    const { host, name } = mongoose.connection;
    console.log(`[db] MongoDB connected: ${host} / ${name}`);
    
    return cachedConnection;
  } catch (err) {
    console.error("[db] Initial MongoDB connection failed:", err.message);
    throw err; 
  }
}

export async function closeDB() {
  // Vercel par iski zaroorat nahi hoti, par local ke liye theek hai
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log("[db] MongoDB connection closed.");
  }
}