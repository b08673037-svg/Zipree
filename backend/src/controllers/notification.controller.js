// Notification controllers. All operate on the current user's inbox only.

import Notification from "../models/Notification.js";

// GET /api/notifications
export async function listMyNotifications(req, res, next) {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unread,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      notifications,
    });
  } catch (e) {
    next(e);
  }
}

// GET /api/notifications/unread-count
export async function unreadCount(req, res, next) {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    return res.status(200).json({ success: true, unread: count });
  } catch (e) {
    next(e);
  }
}

// PATCH /api/notifications/:id/read
export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.status(200).json({ success: true, notification });
  } catch (e) {
    next(e);
  }
}

// PATCH /api/notifications/read-all
export async function markAllAsRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res
      .status(200)
      .json({ success: true, message: `${result.modifiedCount} notifications marked as read.` });
  } catch (e) {
    next(e);
  }
}

// DELETE /api/notifications/:id
export async function deleteNotification(req, res, next) {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (e) {
    next(e);
  }
}