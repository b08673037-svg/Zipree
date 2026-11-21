import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers, FiUserCheck, FiUserX, FiUserPlus,
  FiSearch, FiEye, FiX, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { api } from "../../lib/apiClient.js";
import { formatCurrency, formatDate } from "../../lib/format.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import AdminCustomDropdown from "../../components/admin/AdminCustomDropdown.jsx";
import "./AdminCustomers.css";

const STATUS_OPTIONS = [
  { label: "All Customers", value: "" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
];

export default function AdminCustomers() {
  useDocumentTitle("Customers");

  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/customers/stats");
        setStats(res.stats);
      } catch (err) {
        console.error("Failed to load customer stats", err);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchCustomers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("accountStatus", statusFilter);
        params.set("page", currentPage);
        params.set("limit", "10");

        const res = await api.get(`/admin/customers?${params.toString()}`);
        if (!cancelled) {
          setCustomers(res.customers);
          setPagination({ page: res.page, pages: res.pages, total: res.total });
        }
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchCustomers, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, statusFilter, currentPage]);

  const openCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetails(null);
    try {
      const res = await api.get(`/admin/customers/${customer._id}`);
      setCustomerDetails(res);
    } catch (err) {
      console.error("Failed to load customer details", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      <div className="zipree-customers__header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer base and view their rental history.</p>
        </div>
      </div>

      {stats && (
        <div className="zipree-customers__kpis">
          <div className="zipree-customers__kpi">
            <div className="zipree-customers__kpi-icon" style={{ background: "rgba(198,164,106,0.15)", color: "#C6A46A" }}><FiUsers /></div>
            <div>
              <p className="zipree-customers__kpi-value">{stats.total}</p>
              <p className="zipree-customers__kpi-label">Total Customers</p>
            </div>
          </div>
          <div className="zipree-customers__kpi">
            <div className="zipree-customers__kpi-icon" style={{ background: "rgba(107,168,132,0.15)", color: "#6BA884" }}><FiUserCheck /></div>
            <div>
              <p className="zipree-customers__kpi-value">{stats.active}</p>
              <p className="zipree-customers__kpi-label">Active</p>
            </div>
          </div>
          <div className="zipree-customers__kpi">
            <div className="zipree-customers__kpi-icon" style={{ background: "rgba(200,104,96,0.15)", color: "#C86860" }}><FiUserX /></div>
            <div>
              <p className="zipree-customers__kpi-value">{stats.suspended}</p>
              <p className="zipree-customers__kpi-label">Suspended</p>
            </div>
          </div>
          <div className="zipree-customers__kpi">
            <div className="zipree-customers__kpi-icon" style={{ background: "rgba(143,161,179,0.15)", color: "#8FA1B3" }}><FiUserPlus /></div>
            <div>
              <p className="zipree-customers__kpi-value">{stats.newThisMonth}</p>
              <p className="zipree-customers__kpi-label">New This Month</p>
            </div>
          </div>
        </div>
      )}

      <div className="zipree-customers__toolbar">
        <div className="zipree-customers__search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <AdminCustomDropdown
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Customers"
          className="zipree-dropdown--filter"
        />
      </div>

      <div className="zipree-customers__table-card">
        {loading ? (
          <p className="zipree-customers__empty">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="zipree-customers__empty">No customers found.</p>
        ) : (
          <div className="zipree-customers__table-wrapper">
            <table className="zipree-customers__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="zipree-customers__avatar-cell">
                        <div className="zipree-customers__avatar">
                          {c.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="zipree-customers__name">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      <span className={`zipree-customers__badge zipree-customers__badge--${c.accountStatus}`}>
                        {c.accountStatus}
                      </span>
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => openCustomer(c)}
                        className="zipree-customers__view-btn"
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
        <div className="zipree-customers__pagination">
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
        {selectedCustomer && (
          <motion.div
            className="zipree-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCustomer(null)}
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
                  <p className="zipree-drawer__eyebrow">Customer</p>
                  <h2 className="zipree-drawer__title">{selectedCustomer.name}</h2>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="zipree-drawer__close-btn">
                  <FiX />
                </button>
              </div>

              <div className="zipree-drawer__content">
                {!customerDetails ? (
                  <p className="zipree-customers__empty">Loading...</p>
                ) : (
                  <>
                    <div className="zipree-drawer__section">
                      <h3 className="zipree-drawer__section-title">Contact Info</h3>
                      <p className="zipree-drawer__info-value">{customerDetails.customer.email}</p>
                      <p className="zipree-drawer__info-sub">{customerDetails.customer.phone || "No phone"}</p>
                      <p className="zipree-drawer__info-sub">Joined {formatDate(customerDetails.customer.createdAt)}</p>
                    </div>

                    <div className="zipree-drawer__section">
                      <h3 className="zipree-drawer__section-title">Rental Summary</h3>
                      <div className="zipree-drawer__grid-2">
                        <div>
                          <p className="zipree-drawer__label">Total Bookings</p>
                          <p className="zipree-drawer__value">{customerDetails.stats.totalBookings}</p>
                        </div>
                        <div>
                          <p className="zipree-drawer__label">Total Spent</p>
                          <p className="zipree-drawer__value">{formatCurrency(customerDetails.stats.totalSpent)}</p>
                        </div>
                        <div>
                          <p className="zipree-drawer__label">Active</p>
                          <p className="zipree-drawer__value">{customerDetails.stats.activeBookings}</p>
                        </div>
                      </div>
                    </div>

                    <div className="zipree-drawer__section">
                      <h3 className="zipree-drawer__section-title">Recent Bookings</h3>
                      {customerDetails.bookings.length === 0 ? (
                        <p className="zipree-drawer__info-sub">No bookings yet.</p>
                      ) : (
                        customerDetails.bookings.map(b => (
                          <div key={b._id} className="zipree-customers__booking-row">
                            <div>
                              <p className="zipree-drawer__info-value">{b.car?.brand} {b.car?.model}</p>
                              <p className="zipree-drawer__info-sub">{formatDate(b.pickupDateTime)} → {formatDate(b.returnDateTime)}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p className="zipree-drawer__info-value">{formatCurrency(b.total)}</p>
                              <span className={`zipree-booking-badge zipree-booking-badge--${b.bookingStatus}`}>
                                {b.bookingStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}