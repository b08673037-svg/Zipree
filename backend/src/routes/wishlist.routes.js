import { Router } from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getMyWishlist);
router.post("/:carId", protect, addToWishlist);
router.delete("/:carId", protect, removeFromWishlist);

export default router;