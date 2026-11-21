
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiDollarSign, FiCalendar, FiTrendingUp, FiCheckCircle, FiXCircle,
  FiDownload, FiChevronDown, FiCheck
} from "react-icons/fi";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { api } from "../../lib/apiClient.js";
import { formatCurrency } from "../../lib/format.js";
import "./AdminAnalytics.css";

const RANGE_OPTIONS = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Year", value: "365d" },
];

const STATUS_COLORS = {
  pending: "#D9A45A",
  confirmed: "#6BA884",
  active: "#8FA1B3",
  completed: "#A7ADB2",
  cancelled: "#C86860",
};

/* Custom ZIPREE Dropdown */
function AnalyticsRangeDropdown({ value, onChange, options }) {
  const dropdownRef = useRef(null);
  const dropdownId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openDropdown() {
    setActiveIndex(selectedIndex);
    setIsOpen((previous) => !previous);
  }

  function selectOption(option) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex);
      } else {
        setActiveIndex((previous) =>
          Math.min(previous + 1, options.length - 1)
        );
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex);
      } else {
        setActiveIndex((previous) => Math.max(previous - 1, 0));
      }
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      isOpen
    ) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div
      className="zipree-analytics-dropdown"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`zipree-analytics-dropdown__trigger ${
          isOpen ? "is-open" : ""
        }`}
        onClick={openDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        <span>{selectedOption?.label || "Select Date Range"}</span>
        <FiChevronDown
          className={`zipree-analytics-dropdown__arrow ${
            isOpen ? "is-rotated" : ""
          }`}
        />
      </button>

      {isOpen && (
        <motion.div
          id={dropdownId}
          className="zipree-analytics-dropdown__menu"
          role="listbox"
          aria-label="Select analytics date range"
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 7 }}
          transition={{ duration: 0.16 }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                type="button"
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`zipree-analytics-dropdown__option ${
                  isSelected ? "is-selected" : ""
                } ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck />}
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  useDocumentTitle("Business Analytics");

  const [range, setRange] = useState("30d");
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [topCars, setTopCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      try {
        const [
          summaryRes,
          revRes,
          bookRes,
          custRes,
          topRes
        ] = await Promise.all([
          api.get(`/admin/analytics/summary?range=${range}`),
          api.get(`/admin/analytics/revenue?range=${range}`),
          api.get(`/admin/analytics/bookings?range=${range}`),
          api.get(`/admin/analytics/customers?range=${range}`),
          api.get(`/admin/analytics/top-cars`),
        ]);

        setSummary(summaryRes.summary);
        setRevenueData(revRes.series);
        setBookingsData(bookRes.series);
        setCustomerData(custRes.series);
        setTopCars(topRes.byRevenue);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [range]);

  // Aggregate booking status totals for the donut
  const statusTotals = bookingsData.reduce(
    (acc, day) => {
      ["pending", "confirmed", "active", "completed", "cancelled"].forEach(
        (status) => {
          acc[status] = (acc[status] || 0) + (day[status] || 0);
        }
      );

      return acc;
    },
    {}
  );

  const statusDonut = Object.entries(statusTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // CSV Export
  const handleExport = () => {
    setExporting(true);

    try {
      const rows = [["Date", "Revenue"]];

      revenueData.forEach((row) => {
        rows.push([row.date, row.value]);
      });

      const csv = rows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `zipree-analytics-${range}-${Date.now()}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const fmtChange = (val) => {
    const positive = val >= 0;

    return {
      text: `${positive ? "+" : ""}${val}%`,
      color: positive ? "#6BA884" : "#C86860",
    };
  };

  if (loading && !summary) {
    return (
      <p style={{ color: "var(--color-silver)" }}>
        Loading analytics...
      </p>
    );
  }

  return (
    <motion.div
      className="zipree-analytics-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="zipree-analytics-header">
        <div>
          <h1>Business Analytics</h1>
          <p>Track revenue, bookings and fleet performance.</p>
        </div>

        <div className="zipree-analytics-header__actions">
          <AnalyticsRangeDropdown
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS}
          />

          <button
            onClick={handleExport}
            disabled={exporting}
            className="zipree-analytics-export"
          >
            <FiDownload />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="zipree-analytics-kpi-grid">
        <div className="zipree-analytics-kpi">
          <div
            className="zipree-analytics-kpi__icon"
            style={{
              background: "rgba(107,168,132,0.15)",
              color: "#6BA884",
            }}
          >
            <FiDollarSign />
          </div>
          <div className="zipree-analytics-kpi__content">
            <p className="zipree-analytics-kpi__label">Total Revenue</p>
            <p className="zipree-analytics-kpi__value">
              {formatCurrency(summary.totalRevenue)}
            </p>
            <p
              className="zipree-analytics-kpi__change"
              style={{ color: fmtChange(summary.revenueChange).color }}
            >
              {fmtChange(summary.revenueChange).text} vs previous
            </p>
          </div>
        </div>

        <div className="zipree-analytics-kpi">
          <div
            className="zipree-analytics-kpi__icon"
            style={{
              background: "rgba(198,164,106,0.15)",
              color: "#C6A46A",
            }}
          >
            <FiCalendar />
          </div>
          <div className="zipree-analytics-kpi__content">
            <p className="zipree-analytics-kpi__label">Total Bookings</p>
            <p className="zipree-analytics-kpi__value">
              {summary.totalBookings}
            </p>
            <p
              className="zipree-analytics-kpi__change"
              style={{ color: fmtChange(summary.bookingsChange).color }}
            >
              {fmtChange(summary.bookingsChange).text} vs previous
            </p>
          </div>
        </div>

        <div className="zipree-analytics-kpi">
          <div
            className="zipree-analytics-kpi__icon"
            style={{
              background: "rgba(143,161,179,0.15)",
              color: "#8FA1B3",
            }}
          >
            <FiTrendingUp />
          </div>
          <div className="zipree-analytics-kpi__content">
            <p className="zipree-analytics-kpi__label">Avg Booking Value</p>
            <p className="zipree-analytics-kpi__value">
              {formatCurrency(summary.avgBookingValue)}
            </p>
            <p
              className="zipree-analytics-kpi__change"
              style={{ color: "var(--color-silver)" }}
            >
              per reservation
            </p>
          </div>
        </div>

        <div className="zipree-analytics-kpi">
          <div
            className="zipree-analytics-kpi__icon"
            style={{
              background: "rgba(107,168,132,0.15)",
              color: "#6BA884",
            }}
          >
            <FiCheckCircle />
          </div>
          <div className="zipree-analytics-kpi__content">
            <p className="zipree-analytics-kpi__label">Completed</p>
            <p className="zipree-analytics-kpi__value">
              {summary.completedBookings}
            </p>
            <p
              className="zipree-analytics-kpi__change"
              style={{ color: "var(--color-silver)" }}
            >
              successful rentals
            </p>
          </div>
        </div>

        <div className="zipree-analytics-kpi">
          <div
            className="zipree-analytics-kpi__icon"
            style={{
              background: "rgba(200,104,96,0.15)",
              color: "#C86860",
            }}
          >
            <FiXCircle />
          </div>
          <div className="zipree-analytics-kpi__content">
            <p className="zipree-analytics-kpi__label">Cancellation Rate</p>
            <p className="zipree-analytics-kpi__value">
              {summary.cancellationRate}%
            </p>
            <p
              className="zipree-analytics-kpi__change"
              style={{ color: "var(--color-silver)" }}
            >
              of total bookings
            </p>
          </div>
        </div>
      </div>

      {/* ROW 1: REVENUE + STATUS DONUT */}
      <div className="zipree-analytics-row">
        <div className="zipree-analytics-card">
          <h3 className="zipree-analytics-card__title">Revenue Trends</h3>

          {revenueData.length > 0 ? (
            <div className="zipree-analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRev"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#C6A46A"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="#C6A46A"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#25282A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F3EF",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C6A46A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    activeDot={{
                      r: 5,
                      fill: "#C6A46A",
                      stroke: "#111315",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="zipree-analytics-empty">
              No revenue data for this period.
            </p>
          )}
        </div>

        <div className="zipree-analytics-card">
          <h3 className="zipree-analytics-card__title">Booking Status</h3>

          {statusDonut.length > 0 ? (
            <div className="zipree-analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDonut}
                    cx="50%"
                    cy="45%"
                    innerRadius="48%"
                    outerRadius="72%"
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDonut.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={STATUS_COLORS[entry.name] || "#A7ADB2"}
                        stroke="#25282A"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#25282A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F3EF",
                      borderRadius: "8px",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "#A7ADB2",
                      paddingTop: "12px",
                    }}
                    formatter={(value) => (
                      <span
                        style={{
                          textTransform: "capitalize",
                          color: "#A7ADB2",
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="zipree-analytics-empty">
              No bookings in this period.
            </p>
          )}
        </div>
      </div>

      {/* ROW 2: BOOKING ACTIVITY + CUSTOMER GROWTH */}
      <div className="zipree-analytics-row">
        <div className="zipree-analytics-card">
          <h3 className="zipree-analytics-card__title">Booking Activity</h3>

          {bookingsData.length > 0 ? (
            <div className="zipree-analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingsData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#25282A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F3EF",
                      borderRadius: "8px",
                    }}
                  />

                  <Bar
                    dataKey="pending"
                    stackId="a"
                    fill="#D9A45A"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="confirmed"
                    stackId="a"
                    fill="#6BA884"
                  />
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="#A7ADB2"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="zipree-analytics-empty">
              No booking activity.
            </p>
          )}
        </div>

        <div className="zipree-analytics-card">
          <h3 className="zipree-analytics-card__title">Customer Growth</h3>

          {customerData.length > 0 ? (
            <div className="zipree-analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={customerData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    stroke="#A7ADB2"
                    tick={{ fill: "#A7ADB2", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#25282A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F3EF",
                      borderRadius: "8px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6BA884"
                    strokeWidth={2.5}
                    dot={{
                      fill: "#6BA884",
                      r: 3,
                      strokeWidth: 0,
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="zipree-analytics-empty">
              No new customers in this period.
            </p>
          )}
        </div>
      </div>

      {/* TOP VEHICLES TABLE */}
      <div className="zipree-analytics-card zipree-analytics-top-cars">
        <h3 className="zipree-analytics-card__title">
          Top Performing Vehicles
        </h3>

        <div className="zipree-analytics-table-wrapper">
          <table className="zipree-analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Vehicle</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>

            <tbody>
              {topCars.map((car, index) => (
                <tr key={car.carId}>
                  <td className="zipree-analytics-rank">
                    #{index + 1}
                  </td>
                  <td>{car.label}</td>
                  <td>{car.bookings}</td>
                  <td>{formatCurrency(car.revenue)}</td>
                </tr>
              ))}

              {topCars.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="zipree-analytics-no-data"
                  >
                    No vehicle data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
