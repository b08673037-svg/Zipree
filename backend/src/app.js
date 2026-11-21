// Express app factory.
// Builds middleware and routes, then exports the app.
// server.js imports this and calls app.listen — so tests can import app.js
// without opening a port.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import carRoutes from "./routes/car.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import contactRoutes from "./routes/contact.routes.js";

const app = express();

// ---- Security & parsing ----
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging (dev only) ----
if (config.isDev) {
  app.use(morgan("dev"));
}

// ---- Routes ----
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);

// ---- 404 + error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

export default app;