import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiDollarSign, FiCalendar, FiTruck, FiUsers, FiClock, 
  FiPlus, FiArrowRight, FiMail
} from "react-icons/fi";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDate } from "../../lib/format.js";
import KpiCard from "../../components/dashboard/KpiCard.jsx";
import "./AdminOverview.css";

const QUICK_ACTIONS = [
  { label: "Add New Vehicle", icon: FiPlus, to: "/admin/fleet" },
  { label: "Manage Bookings", icon: FiCalendar, to: "/admin/bookings" },
  { label: "View Customers", icon: FiUsers, to: "/admin/customers" },
  { label: "Inbox Messages", icon: FiMail, to: "/admin/messages" },
];

export default function AdminOverview() {
  useDocumentTitle("Admin Overview");

  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, revenueRes, bookingsRes, recentRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/analytics/revenue?range=30d"),
          api.get("/admin/analytics/bookings?range=30d"),
          api.get("/admin/recent")
        ]);
        setOverview(overviewRes.overview);
        setRevenueData(revenueRes.series);
        setBookingsData(bookingsRes.series);
        setRecent(recentRes.recent);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !overview) {
    return <p style={{ color: "var(--color-silver)" }}>Loading admin data...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      {/* 1. HEADER */}
      <div className="zipree-admin-header">
        <h1>Overview</h1>
        <p>Business performance at a glance.</p>
      </div>

      {/* 2. KPI CARDS */}
      <div className="zipree-admin-kpi-grid">
        <KpiCard icon={FiDollarSign} label="Total Revenue" value={formatCurrency(overview.totalRevenue)} color="#6BA884" />
        <KpiCard icon={FiCalendar} label="Total Bookings" value={overview.totalBookings} color="#C6A46A" />
        <KpiCard icon={FiClock} label="Pending" value={overview.pendingBookings} color="#D9A45A" />
        <KpiCard icon={FiTruck} label="Active Cars" value={overview.activeCars} color="#A7ADB2" />
        <KpiCard icon={FiUsers} label="Customers" value={overview.totalCustomers} color="#C86860" />
      </div>

      {/* 3. CHARTS ROW */}
      <div className="zipree-admin-charts-row">
        
        {/* Revenue Chart */}
        <div className="zipree-admin-chart-card">
          <h3 className="zipree-admin-chart-card__title">Revenue (Last 30 Days)</h3>
          <div style={{ height: 280, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} />
                <YAxis stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: "#25282A", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F3EF" }}
                  itemStyle={{ color: "#C6A46A" }}
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                />
                <Line type="monotone" dataKey="value" stroke="#C6A46A" strokeWidth={2} dot={{ fill: "#C6A46A", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="zipree-admin-chart-card">
          <h3 className="zipree-admin-chart-card__title">Bookings Activity</h3>
          <div style={{ height: 280, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} />
                <YAxis stroke="#A7ADB2" tick={{ fill: "#A7ADB2", fontSize: 11 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: "#25282A", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F3EF" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="pending" stackId="a" fill="#D9A45A" radius={[0, 0, 0, 0]} />
                <Bar dataKey="confirmed" stackId="a" fill="#6BA884" radius={[0, 0, 0, 0]} />
                <Bar dataKey="completed" stackId="a" fill="#A7ADB2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. QUICK ACTIONS */}
      <div className="zipree-admin-quick-actions">
        <h3 className="zipree-admin-section-title">Quick Actions</h3>
        <div className="zipree-admin-actions-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={action.to} className="zipree-admin-action-card">
              <div className="zipree-admin-action-card__icon">
                <action.icon />
              </div>
              <span className="zipree-admin-action-card__label">{action.label}</span>
              <FiArrowRight className="zipree-admin-action-card__arrow" />
            </Link>
          ))}
        </div>
      </div>

      {/* 5. RECENT BOOKINGS TABLE */}
      <div className="zipree-admin-table-card">
        <div className="zipree-admin-table-header">
          <h3 className="zipree-admin-chart-card__title">Recent Bookings</h3>
          <Link to="/admin/bookings" className="zipree-admin-link">View All</Link>
        </div>
        <div className="zipree-admin-table-wrapper">
          <table className="zipree-admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Pickup Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(booking => (
                <tr key={booking._id}>
                  <td className="mono">{booking.bookingReference}</td>
                  <td>{booking.customer?.name || "Unknown User"}</td>
                  <td>
                    {booking.car 
                      ? `${booking.car.brand} ${booking.car.model}` 
                      : "Vehicle Unavailable"}
                  </td>
                  <td>{formatDate(booking.pickupDateTime)}</td>
                  <td>
                    <span className={`zipree-status-badge status-${booking.bookingStatus}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td>{formatCurrency(booking.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}