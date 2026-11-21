import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCalendar, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiDollarSign,
  FiSearch, FiDownload, FiEye, FiX, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDate, formatDateTime } from "../../lib/format.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import AdminCustomDropdown from "../../components/admin/AdminCustomDropdown.jsx";
import BookingDetailsDrawer from "../../components/admin/BookingDetailsDrawer.jsx";
import "./AdminBookings.css";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const PAYMENT_OPTIONS = [
  { label: "All Payments", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Refunded", value: "refunded" },
  { label: "Failed", value: "failed" },
];

const STATUS_COLORS = {
  pending: "#D9A45A",
  confirmed: "#6BA884",
  active: "#8FA1B3",
  completed: "#A7ADB2",
  cancelled: "#C86860",
};

export default function AdminBookings() {
  useDocumentTitle("All Bookings");

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch stats + analytics once
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get("/admin/bookings/stats"),
          api.get("/admin/bookings/analytics?range=30d"),
        ]);
        setStats(statsRes.stats);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error("Failed to load booking stats", err);
      }
    }
    fetchMeta();
  }, []);

  // Fetch bookings when filters or page change
  useEffect(() => {
    let cancelled = false;
    async function fetchBookings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        if (paymentFilter) params.set("paymentStatus", paymentFilter);
        params.set("page", currentPage);
        params.set("limit", "10");

        const res = await api.get(`/bookings?${params.toString()}`);
        if (!cancelled) {
          setBookings(res.bookings);
          setPagination({ page: res.page, pages: res.pages, total: res.total });
        }
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchBookings, 300); // debounce search
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, statusFilter, paymentFilter, currentPage]);

  const handleExport = () => {
    const rows = [
      ["Ref", "Customer", "Vehicle", "Pickup", "Return", "Total", "Payment", "Status"],
      ...bookings.map(b => [
        b.bookingReference,
        b.customer?.name || "",
        `${b.car?.brand || ""} ${b.car?.model || ""}`,
        formatDate(b.pickupDateTime),
        formatDate(b.returnDateTime),
        b.total,
        b.paymentStatus,
        b.bookingStatus,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zipree-bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusChartData = analytics 
    ? Object.entries(analytics.statusDistribution)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      {/* HEADER */}
      <div className="zipree-bookings__header">
        <div>
          <h1>All Bookings</h1>
          <p>Manage reservations, monitor rental activity, and stay in control of every journey.</p>
        </div>
        <button onClick={handleExport} className="zipree-bookings__export-btn">
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* KPI CARDS */}
      {stats && (
        <div className="zipree-bookings__kpis">
          <div className="zipree-bookings__kpi">
            <div className="zipree-bookings__kpi-icon" style={{ background: "rgba(198,164,106,0.15)", color: "#C6A46A" }}><FiCalendar /></div>
            <div>
              <p className="zipree-bookings__kpi-value">{stats.total}</p>
              <p className="zipree-bookings__kpi-label">Total Bookings</p>
            </div>
          </div>
          <div className="zipree-bookings__kpi">
            <div className="zipree-bookings__kpi-icon" style={{ background: "rgba(217,164,90,0.15)", color: "#D9A45A" }}><FiClock /></div>
            <div>
              <p className="zipree-bookings__kpi-value">{stats.pending}</p>
              <p className="zipree-bookings__kpi-label">Pending</p>
            </div>
          </div>
          <div className="zipree-bookings__kpi">
            <div className="zipree-bookings__kpi-icon" style={{ background: "rgba(107,168,132,0.15)", color: "#6BA884" }}><FiCheckCircle /></div>
            <div>
              <p className="zipree-bookings__kpi-value">{stats.confirmed + stats.active}</p>
              <p className="zipree-bookings__kpi-label">In Progress</p>
            </div>
          </div>
          <div className="zipree-bookings__kpi">
            <div className="zipree-bookings__kpi-icon" style={{ background: "rgba(167,173,178,0.15)", color: "#A7ADB2" }}><FiTruck /></div>
            <div>
              <p className="zipree-bookings__kpi-value">{stats.completed}</p>
              <p className="zipree-bookings__kpi-label">Completed</p>
            </div>
          </div>
          <div className="zipree-bookings__kpi">
            <div className="zipree-bookings__kpi-icon" style={{ background: "rgba(200,104,96,0.15)", color: "#C86860" }}><FiXCircle /></div>
            <div>
              <p className="zipree-bookings__kpi-value">{stats.cancelled}</p>
              <p className="zipree-bookings__kpi-label">Cancelled</p>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS */}
      {analytics && (
        <div className="zipree-bookings__charts">
          <div className="zipree-bookings__chart-card">
            <h3 className="zipree-bookings__chart-title">Booking Activity (30 Days)</h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} />
                  <YAxis stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#25282A", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F3EF" }} />
                  <Line type="monotone" dataKey="value" stroke="#C6A46A" strokeWidth={2} dot={{ fill: "#C6A46A", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="zipree-bookings__chart-card">
            <h3 className="zipree-bookings__chart-title">Status Distribution</h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#A7ADB2"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#25282A", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F3EF" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#A7ADB2" }} formatter={(v) => <span style={{ color: "#A7ADB2", textTransform: "capitalize" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="zipree-bookings__filters">
        <div className="zipree-bookings__search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by ref, customer, or vehicle..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <AdminCustomDropdown
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="zipree-dropdown--filter"
        />
        <AdminCustomDropdown
          value={paymentFilter}
          onChange={(v) => { setPaymentFilter(v); setCurrentPage(1); }}
          options={PAYMENT_OPTIONS}
          placeholder="All Payments"
          className="zipree-dropdown--filter"
        />
      </div>

      {/* TABLE */}
      <div className="zipree-bookings__table-card">
        {loading ? (
          <p className="zipree-bookings__empty">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="zipree-bookings__empty">No bookings found.</p>
        ) : (
          <div className="zipree-bookings__table-wrapper">
            <table className="zipree-bookings__table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td className="zipree-bookings__ref">{b.bookingReference}</td>
                    <td>
                      <p className="zipree-bookings__cust-name">{b.customer?.name || "Unknown"}</p>
                      <p className="zipree-bookings__cust-email">{b.customer?.email || ""}</p>
                    </td>
                    <td>
                      <div className="zipree-bookings__vehicle">
                        <img src={b.car?.images?.[0]} alt={b.car?.model} />
                        <span>{b.car?.brand} {b.car?.model}</span>
                      </div>
                    </td>
                    <td>{formatDate(b.pickupDateTime)}</td>
                    <td>{formatDate(b.returnDateTime)}</td>
                    <td>{formatCurrency(b.total)}</td>
                    <td>
                      <span className={`zipree-booking-badge zipree-booking-badge--payment-${b.paymentStatus}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`zipree-booking-badge zipree-booking-badge--${b.bookingStatus}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        className="zipree-bookings__view-btn"
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

      {/* PAGINATION */}
      {pagination.pages > 1 && (
        <div className="zipree-bookings__pagination">
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

       {/* BOOKING DETAILS DRAWER */}
      {selectedBooking && (
        <BookingDetailsDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSuccess={() => {
            // Refresh the bookings list after a status change
            setCurrentPage(1);
            setSearch("");
            setStatusFilter("");
            setPaymentFilter("");
            // Trigger a re-fetch by reusing the same effect
            // Simplest: force a re-render
            window.location.reload();
          }}
        />
      )}

    </motion.div>
  );
}