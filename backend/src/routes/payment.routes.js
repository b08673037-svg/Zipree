import { Router } from "express";
import {
  createPayment,
  updatePaymentStatus,
  getPaymentsForBooking,
} from "../controllers/payment.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, restrictTo("admin"), createPayment);
router.patch("/:id/status", protect, restrictTo("admin"), updatePaymentStatus);
router.get("/booking/:bookingId", protect, getPaymentsForBooking);

export default router;