
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiTruck,
  FiCheckCircle,
  FiStar,
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { api } from "../../lib/apiClient.js";
import { formatCurrency } from "../../lib/format.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import VehicleFormModal from "../../components/admin/VehicleFormModal.jsx";
import AdminCustomDropdown from "../../components/admin/AdminCustomDropdown.jsx";
import "./AdminFleet.css";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Economy", value: "economy" },
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Sports", value: "sports" },
  { label: "Luxury", value: "luxury" },
  { label: "Electric", value: "electric" },
];

export default function AdminFleet() {
  useDocumentTitle("Fleet Management");

  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [statsRes, carsRes] = await Promise.all([
        api.get("/admin/fleet-stats"),
        api.get("/cars?limit=50&sort=-createdAt"),
      ]);

      setStats(statsRes.stats);
      setCars(carsRes.cars);
    } catch (err) {
      console.error("Failed to load fleet data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      await api.del(`/cars/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to delete.");
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || car.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading || !stats) {
    return (
      <p style={{ color: "var(--color-silver)" }}>
        Loading fleet data...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="zipree-fleet-page"
    >
      <div className="zipree-fleet-header">
        <div>
          <h1>Fleet Management</h1>
          <p>Manage your vehicles, availability and fleet performance.</p>
        </div>

        <button
          onClick={() => {
            setEditingCar(null);
            setIsModalOpen(true);
          }}
          className="zipree-fleet-add-btn"
        >
          <FiPlus />
          Add New Vehicle
        </button>
      </div>

      <div className="zipree-fleet-kpi-grid">
        <div className="zipree-fleet-kpi">
          <div
            className="zipree-fleet-kpi__icon"
            style={{
              background: "rgba(198,164,106,0.15)",
              color: "#C6A46A",
            }}
          >
            <FiTruck />
          </div>
          <div>
            <p className="zipree-fleet-kpi__label">Total Vehicles</p>
            <p className="zipree-fleet-kpi__value">
              {stats.totalVehicles}
            </p>
          </div>
        </div>

        <div className="zipree-fleet-kpi">
          <div
            className="zipree-fleet-kpi__icon"
            style={{
              background: "rgba(107,168,132,0.15)",
              color: "#6BA884",
            }}
          >
            <FiCheckCircle />
          </div>
          <div>
            <p className="zipree-fleet-kpi__label">Active</p>
            <p className="zipree-fleet-kpi__value">
              {stats.activeVehicles}
            </p>
          </div>
        </div>

        <div className="zipree-fleet-kpi">
          <div
            className="zipree-fleet-kpi__icon"
            style={{
              background: "rgba(143,161,179,0.15)",
              color: "#8FA1B3",
            }}
          >
            <FiStar />
          </div>
          <div>
            <p className="zipree-fleet-kpi__label">Featured</p>
            <p className="zipree-fleet-kpi__value">
              {stats.featuredVehicles}
            </p>
          </div>
        </div>

        <div className="zipree-fleet-kpi">
          <div
            className="zipree-fleet-kpi__icon"
            style={{
              background: "rgba(107,168,132,0.15)",
              color: "#6BA884",
            }}
          >
            <FiDollarSign />
          </div>
          <div>
            <p className="zipree-fleet-kpi__label">Avg Price</p>
            <p className="zipree-fleet-kpi__value">
              {formatCurrency(stats.avgDailyPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="zipree-fleet-toolbar">
        <div className="zipree-fleet-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <AdminCustomDropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={CATEGORY_OPTIONS}
          placeholder="All Categories"
          ariaLabel="Filter vehicles by category"
          className="zipree-dropdown--filter"
        />
      </div>

      <div className="zipree-fleet-table-card">
        {filteredCars.length === 0 ? (
          <p className="zipree-fleet-no-results">
            No vehicles found.
          </p>
        ) : (
          <div className="zipree-fleet-table-wrapper">
            <table className="zipree-fleet-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <div className="zipree-fleet-vehicle">
                        <img
                          src={car.images[0]}
                          alt={`${car.brand} ${car.model}`}
                        />

                        <div>
                          <p className="zipree-fleet-vehicle__name">
                            {car.brand} {car.model}
                          </p>
                          <p className="zipree-fleet-vehicle__year">
                            {car.year}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="zipree-fleet-category">
                      {car.category}
                    </td>

                    <td>
                      {formatCurrency(car.dailyPrice)}/day
                    </td>

                    <td>
                      <span
                        className={`zipree-status-badge ${
                          car.isActive
                            ? "status-confirmed"
                            : "status-cancelled"
                        }`}
                      >
                        {car.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="zipree-fleet-actions">
                        <button
                          onClick={() => {
                            setEditingCar(car);
                            setIsModalOpen(true);
                          }}
                          className="zipree-table-btn"
                          title="Edit"
                          aria-label={`Edit ${car.brand} ${car.model}`}
                        >
                          <FiEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(car._id)}
                          className="zipree-table-btn zipree-table-btn--danger"
                          title="Delete"
                          aria-label={`Delete ${car.brand} ${car.model}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCar={editingCar}
        onSuccess={fetchData}
      />
    </motion.div>
  );
}
