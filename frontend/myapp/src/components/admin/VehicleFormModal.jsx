
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { api } from "../../lib/apiClient.js";
import AdminCustomDropdown from "./AdminCustomDropdown.jsx";
import "./VehicleFormModal.css";

const INITIAL_STATE = {
  brand: "",
  model: "",
  year: 2024,
  category: "luxury",
  dailyPrice: "",
  transmission: "automatic",
  fuel: "petrol",
  seating: 5,
  description: "",
  images: [""],
  features: [""],
  pickupLocations: ["Lahore"],
  isActive: true,
  isFeatured: false,
};

const CATEGORY_OPTIONS = [
  { label: "Economy", value: "economy" },
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Sports", value: "sports" },
  { label: "Luxury", value: "luxury" },
  { label: "Electric", value: "electric" },
];

const TRANSMISSION_OPTIONS = [
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const FUEL_OPTIONS = [
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Electric", value: "electric" },
];

export default function VehicleFormModal({
  isOpen,
  onClose,
  editingCar,
  onSuccess,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCar) {
      setFormData({
        brand: editingCar.brand,
        model: editingCar.model,
        year: editingCar.year,
        category: editingCar.category,
        dailyPrice: editingCar.dailyPrice,
        transmission: editingCar.transmission,
        fuel: editingCar.fuel,
        seating: editingCar.seating,
        description: editingCar.description || "",
        images:
          editingCar.images.length > 0
            ? editingCar.images
            : [""],
        features:
          editingCar.features.length > 0
            ? editingCar.features
            : [""],
        pickupLocations: editingCar.pickupLocations || ["Lahore"],
        isActive: editingCar.isActive,
        isFeatured: editingCar.isFeatured,
      });
    } else {
      setFormData(INITIAL_STATE);
    }

    setError("");
  }, [editingCar, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDropdownChange = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const arr = [...formData[field]];
    arr[index] = value;

    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const removeArrayItem = (field, index) => {
    const arr = formData[field].filter((_, i) => i !== index);

    setFormData({ ...formData, [field]: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      year: Number(formData.year),
      dailyPrice: Number(formData.dailyPrice),
      seating: Number(formData.seating),
      images: formData.images.filter(Boolean),
      features: formData.features.filter(Boolean),
      pickupLocations: formData.pickupLocations.filter(Boolean),
    };

    try {
      if (editingCar) {
        await api.put(`/cars/${editingCar._id}`, payload);
      } else {
        await api.post("/cars", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save vehicle.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="zipree-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="zipree-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="zipree-modal__header">
            <h2>{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close vehicle form"
            >
              <FiX />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="zipree-modal__body"
          >
            {error && (
              <div className="zipree-modal__error">{error}</div>
            )}

            <div className="zipree-modal__row">
              <div className="zipree-modal__field">
                <label>Brand</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="zipree-modal__field">
                <label>Model</label>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="zipree-modal__row">
              <div className="zipree-modal__field">
                <label>Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="zipree-modal__field">
                <label>Category</label>
                <AdminCustomDropdown
                  value={formData.category}
                  onChange={(value) =>
                    handleDropdownChange("category", value)
                  }
                  options={CATEGORY_OPTIONS}
                  ariaLabel="Vehicle category"
                />
              </div>
            </div>

            <div className="zipree-modal__row">
              <div className="zipree-modal__field">
                <label>Daily Price ($)</label>
                <input
                  type="number"
                  name="dailyPrice"
                  value={formData.dailyPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="zipree-modal__field">
                <label>Seating</label>
                <input
                  type="number"
                  name="seating"
                  value={formData.seating}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="zipree-modal__row">
              <div className="zipree-modal__field">
                <label>Transmission</label>
                <AdminCustomDropdown
                  value={formData.transmission}
                  onChange={(value) =>
                    handleDropdownChange("transmission", value)
                  }
                  options={TRANSMISSION_OPTIONS}
                  ariaLabel="Vehicle transmission"
                />
              </div>

              <div className="zipree-modal__field">
                <label>Fuel</label>
                <AdminCustomDropdown
                  value={formData.fuel}
                  onChange={(value) =>
                    handleDropdownChange("fuel", value)
                  }
                  options={FUEL_OPTIONS}
                  ariaLabel="Vehicle fuel type"
                />
              </div>
            </div>

            <div className="zipree-modal__field">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="zipree-modal__field">
              <label>Image URLs</label>

              {formData.images.map((img, i) => (
                <div key={i} className="zipree-modal__array-row">
                  <input
                    value={img}
                    onChange={(e) =>
                      handleArrayChange("images", i, e.target.value)
                    }
                    placeholder="https://..."
                  />

                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("images", i)}
                      aria-label="Remove image URL"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem("images")}
                className="zipree-modal__add-btn"
              >
                + Add Image
              </button>
            </div>

            <div className="zipree-modal__field">
              <label>Features</label>

              {formData.features.map((feature, i) => (
                <div key={i} className="zipree-modal__array-row">
                  <input
                    value={feature}
                    onChange={(e) =>
                      handleArrayChange("features", i, e.target.value)
                    }
                    placeholder="e.g. Sunroof"
                  />

                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("features", i)}
                      aria-label="Remove feature"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem("features")}
                className="zipree-modal__add-btn"
              >
                + Add Feature
              </button>
            </div>

            <div className="zipree-modal__flags">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active (available for rent)
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured (shown on homepage)
              </label>
            </div>

            <div className="zipree-modal__actions">
              <button
                type="button"
                onClick={onClose}
                className="zipree-btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="zipree-btn-primary"
              >
                {loading
                  ? "Saving..."
                  : editingCar
                    ? "Save Changes"
                    : "Add Vehicle"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
