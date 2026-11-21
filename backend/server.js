// backend/server.js
import app from "./src/app.js";
import config from "./src/config/index.js";
import { connectDB, closeDB } from "./src/config/db.js";

let server;

async function start() {
  try {
    // 1. Connect to MongoDB first.
    await connectDB();

    // 2. Only start listening if NOT running on Vercel
    if (process.env.VERCEL !== "1") {
      server = app.listen(config.port, () => {
        console.log(
          `[zipree-api] Running in ${config.env} mode on http://localhost:${config.port}`
        );
        console.log(
          `[zipree-api] Health check → http://localhost:${config.port}/api/health`
        );
      });
    } else {
      console.log("[zipree-api] Vercel serverless environment detected.");
    }
  } catch (err) {
    console.error("[zipree-api] Failed to start:", err.message);
    process.exit(1);
  }
}

// ---- Graceful shutdown (Only applies locally) ----
async function shutdown(signal) {
  if (process.env.VERCEL === "1") return;
  
  console.log(`\n[zipree-api] ${signal} received — shutting down...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("[zipree-api] HTTP server closed.");
    }
    await closeDB();
  } catch (err) {
    console.error("[zipree-api] Error during shutdown:", err.message);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("[zipree-api] Unhandled rejection:", reason);
});

start();

// CRITICAL FOR VERCEL:
export default app;