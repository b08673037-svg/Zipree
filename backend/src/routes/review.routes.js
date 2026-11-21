import { Router } from "express";
import {
  createReview,
  listReviewsForCar,
  listMyReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/car/:carId", listReviewsForCar);
router.get("/my", protect, listMyReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

export default router;