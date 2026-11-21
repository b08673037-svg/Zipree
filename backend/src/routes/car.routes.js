// Car routes.
// Public: GET /api/cars, GET /api/cars/:id
// Admin-only: POST /api/cars, PUT/PATCH/DELETE below — gated by protect + restrictTo("admin").

import { Router } from "express";
import {
  createCar,
  listCars,
  getCar,
  updateCar,
  toggleFeatured,
  toggleActive,
  deleteCar,
} from "../controllers/car.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

// ---- Public ----
router.get("/", listCars);
router.get("/:id", getCar);

// ---- Admin only ----
router.post("/", protect, restrictTo("admin"), createCar);
router.put("/:id", protect, restrictTo("admin"), updateCar);
router.patch("/:id/feature", protect, restrictTo("admin"), toggleFeatured);
router.patch("/:id/status", protect, restrictTo("admin"), toggleActive);
router.delete("/:id", protect, restrictTo("admin"), deleteCar);

export default router;