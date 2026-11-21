import { Router } from "express";
import {
  listMyNotifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Order matters: /unread-count and /read-all before /:id-style routes.
router.get("/", protect, listMyNotifications);
router.get("/unread-count", protect, unreadCount);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;