import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import "./Notifications.css";

export default function Notifications() {
  useDocumentTitle("Notifications");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.notifications);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update state locally
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      alert("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      alert("Failed to mark all as read.");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper to format the date nicely
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit" 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="zipree-dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Notifications</h1>
          <p>Updates on your bookings and account.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="zipree-notif-mark-all">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--color-silver)" }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="zipree-dash-empty">
          <h3>No notifications yet</h3>
          <p>When you make a booking or receive an update, it will appear here.</p>
        </div>
      ) : (
        <div className="zipree-notif-list">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`zipree-notif-item ${!notif.isRead ? "is-unread" : ""}`}
            >
              <div className="zipree-notif-item__dot" />
              
              <div className="zipree-notif-item__content">
                <div className="zipree-notif-item__header">
                  <h3>{notif.title}</h3>
                  <span>{formatTime(notif.createdAt)}</span>
                </div>
                <p>{notif.message}</p>
              </div>

              {!notif.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(notif._id)} 
                  className="zipree-notif-item__read-btn"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}