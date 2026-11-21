import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiInbox, FiCheckCircle, FiMessageSquare,
  FiSearch, FiEye, FiX, FiChevronLeft, FiChevronRight, FiCornerUpLeft
} from "react-icons/fi";
import { api } from "../../lib/apiClient.js";
import { formatDate, formatDateTime } from "../../lib/format.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import AdminCustomDropdown from "../../components/admin/AdminCustomDropdown.jsx";
import "./AdminMessages.css";

const STATUS_OPTIONS = [
  { label: "All Messages", value: "" },
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Replied", value: "replied" },
];

export default function AdminMessages() {
  useDocumentTitle("Messages");

  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/messages/stats");
        setStats(res.stats);
      } catch (err) {
        console.error("Failed to load message stats", err);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchMessages() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        params.set("page", currentPage);
        params.set("limit", "10");

        const res = await api.get(`/admin/messages?${params.toString()}`);
        if (!cancelled) {
          setMessages(res.messages);
          setPagination({ page: res.page, pages: res.pages, total: res.total });
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchMessages, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, statusFilter, currentPage]);

  const openMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status === "new") {
      try {
        await api.patch(`/admin/messages/${message._id}/status`, { status: "read" });
        setMessages(prev =>
          prev.map(m => (m._id === message._id ? { ...m, status: "read" } : m))
        );
        setStats(prev => ({
          ...prev,
          new: prev.new - 1,
          read: prev.read + 1,
        }));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleReply = async (message) => {
    try {
      await api.patch(`/admin/messages/${message._id}/status`, { status: "replied" });
      setMessages(prev =>
        prev.map(m => (m._id === message._id ? { ...m, status: "replied" } : m))
      );
      setStats(prev => ({
        ...prev,
        replied: prev.replied + 1,
        read: prev.read - 1,
      }));
      setSelectedMessage({ ...message, status: "replied" });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      <div className="zipree-messages__header">
        <div>
          <h1>Messages</h1>
          <p>Review inquiries from customers and manage your support inbox.</p>
        </div>
      </div>

      {stats && (
        <div className="zipree-messages__kpis">
          <div className="zipree-messages__kpi">
            <div className="zipree-messages__kpi-icon" style={{ background: "rgba(198,164,106,0.15)", color: "#C6A46A" }}><FiInbox /></div>
            <div>
              <p className="zipree-messages__kpi-value">{stats.total}</p>
              <p className="zipree-messages__kpi-label">Total Messages</p>
            </div>
          </div>
          <div className="zipree-messages__kpi">
            <div className="zipree-messages__kpi-icon" style={{ background: "rgba(200,104,96,0.15)", color: "#C86860" }}><FiMail /></div>
            <div>
              <p className="zipree-messages__kpi-value">{stats.new}</p>
              <p className="zipree-messages__kpi-label">New</p>
            </div>
          </div>
          <div className="zipree-messages__kpi">
            <div className="zipree-messages__kpi-icon" style={{ background: "rgba(143,161,179,0.15)", color: "#8FA1B3" }}><FiCheckCircle /></div>
            <div>
              <p className="zipree-messages__kpi-value">{stats.read}</p>
              <p className="zipree-messages__kpi-label">Read</p>
            </div>
          </div>
          <div className="zipree-messages__kpi">
            <div className="zipree-messages__kpi-icon" style={{ background: "rgba(107,168,132,0.15)", color: "#6BA884" }}><FiMessageSquare /></div>
            <div>
              <p className="zipree-messages__kpi-value">{stats.replied}</p>
              <p className="zipree-messages__kpi-label">Replied</p>
            </div>
          </div>
        </div>
      )}

      <div className="zipree-messages__toolbar">
        <div className="zipree-messages__search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <AdminCustomDropdown
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Messages"
          className="zipree-dropdown--filter"
        />
      </div>

      <div className="zipree-messages__table-card">
        {loading ? (
          <p className="zipree-messages__empty">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="zipree-messages__empty">No messages found.</p>
        ) : (
          <div className="zipree-messages__table-wrapper">
            <table className="zipree-messages__table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(m => (
                  <tr key={m._id} className={m.status === "new" ? "is-new" : ""}>
                    <td>
                      <div className="zipree-messages__from-cell">
                        <div className="zipree-messages__avatar">
                          {m.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="zipree-messages__name">{m.name}</p>
                          <p className="zipree-messages__email">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="zipree-messages__subject">{m.subject}</p>
                      <p className="zipree-messages__snippet">{m.message.substring(0, 50)}...</p>
                    </td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <span className={`zipree-messages__badge zipree-messages__badge--${m.status}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openMessage(m)}
                        className="zipree-messages__view-btn"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="zipree-messages__pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <FiChevronLeft /> Prev
          </button>
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            className="zipree-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              className="zipree-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="zipree-drawer__header">
                <div>
                  <p className="zipree-drawer__eyebrow">Message</p>
                  <h2 className="zipree-drawer__title">{selectedMessage.subject}</h2>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="zipree-drawer__close-btn">
                  <FiX />
                </button>
              </div>

              <div className="zipree-drawer__content">
                <div className="zipree-drawer__section">
                  <h3 className="zipree-drawer__section-title">From</h3>
                  <div className="zipree-messages__from-card">
                    <div className="zipree-messages__avatar">
                      {selectedMessage.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="zipree-drawer__info-value">{selectedMessage.name}</p>
                      <p className="zipree-drawer__info-sub">{selectedMessage.email}</p>
                      {selectedMessage.phone && <p className="zipree-drawer__info-sub">{selectedMessage.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="zipree-drawer__section">
                  <h3 className="zipree-drawer__section-title">Message</h3>
                  <p className="zipree-messages__body-text">{selectedMessage.message}</p>
                </div>

                <div className="zipree-drawer__section">
                  <h3 className="zipree-drawer__section-title">Metadata</h3>
                  <div className="zipree-drawer__grid-2">
                    <div>
                      <p className="zipree-drawer__label">Received</p>
                      <p className="zipree-drawer__value">{formatDateTime(selectedMessage.createdAt)}</p>
                    </div>
                    <div>
                      <p className="zipree-drawer__label">Status</p>
                      <span className={`zipree-messages__badge zipree-messages__badge--${selectedMessage.status}`}>
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMessage.status !== "replied" && (
                <div className="zipree-drawer__footer">
                  <button
                    onClick={() => handleReply(selectedMessage)}
                    className="zipree-drawer__btn zipree-drawer__btn--primary"
                  >
                    <FiCornerUpLeft /> Mark as Replied
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}