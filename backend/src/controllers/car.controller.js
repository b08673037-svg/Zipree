// Car controllers — public read endpoints + admin-only write endpoints.
// All admin endpoints are gated in car.routes.js by protect + restrictTo("admin").

import Car, { CAR_CATEGORIES, TRANSMISSIONS, FUEL_TYPES } from "../models/Car.js";

// ---- helpers ----

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

function validateCarPayload(body, { partial = false } = {}) {
  const required = ["brand", "model", "year", "category", "dailyPrice", "transmission", "fuel", "seating"];

  if (!partial) {
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return `${field} is required.`;
      }
    }
  }

  if (body.category !== undefined && !CAR_CATEGORIES.includes(body.category)) {
    return `Invalid category. Allowed: ${CAR_CATEGORIES.join(", ")}.`;
  }
  if (body.transmission !== undefined && !TRANSMISSIONS.includes(body.transmission)) {
    return `Invalid transmission. Allowed: ${TRANSMISSIONS.join(", ")}.`;
  }
  if (body.fuel !== undefined && !FUEL_TYPES.includes(body.fuel)) {
    return `Invalid fuel type. Allowed: ${FUEL_TYPES.join(", ")}.`;
  }
  if (body.year !== undefined) {
    const y = Number(body.year);
    if (Number.isNaN(y) || y < 1990 || y > 2100) return "Year must be between 1990 and 2100.";
  }
  if (body.dailyPrice !== undefined) {
    const p = Number(body.dailyPrice);
    if (Number.isNaN(p) || p < 0) return "Daily price must be a non-negative number.";
  }
  if (body.seating !== undefined) {
    const s = Number(body.seating);
    if (Number.isNaN(s) || s < 1 || s > 12) return "Seating must be between 1 and 12.";
  }

  return null;
}

// ---- Admin: create ----

export async function createCar(req, res, next) {
  try {
    const err = validateCarPayload(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    const car = await Car.create({
      ...pick(req.body, [
        "brand", "model", "year", "category", "images",
        "dailyPrice", "transmission", "fuel", "seating",
        "description", "features", "pickupLocations",
        "isActive", "isFeatured",
      ]),
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: "Car created.", car });
  } catch (e) {
    next(e);
  }
}

// ---- Public: list with filter/sort/pagination ----

export async function listCars(req, res, next) {
  try {
    const {
      category, minPrice, maxPrice, transmission, fuel,
      search, sort = "-createdAt",
      page = "1", limit = "12",
      featured, active,
    } = req.query;

    const filter = {};

    // Public listing defaults to active cars only, unless explicitly asked.
    if (active === "false") filter.isActive = false;
    else filter.isActive = true;

    if (featured === "true") filter.isFeatured = true;
    if (category) filter.category = category;
    if (transmission) filter.transmission = transmission;
    if (fuel) filter.fuel = fuel;

    if (minPrice || maxPrice) {
      filter.dailyPrice = {};
      if (minPrice) filter.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) filter.dailyPrice.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sort).skip(skip).limit(limitNum),
      Car.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: cars.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      cars,
    });
  } catch (e) {
    next(e);
  }
}

// ---- Public: single car ----

export async function getCar(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });
    return res.status(200).json({ success: true, car });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: update ----

export async function updateCar(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });

    const err = validateCarPayload(req.body, { partial: true });
    if (err) return res.status(400).json({ success: false, message: err });

    const allowed = [
      "brand", "model", "year", "category", "images",
      "dailyPrice", "transmission", "fuel", "seating",
      "description", "features", "pickupLocations",
      "isActive", "isFeatured",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) car[key] = req.body[key];
    }

    await car.save();
    return res.status(200).json({ success: true, message: "Car updated.", car });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: toggle featured ----

export async function toggleFeatured(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });
    car.isFeatured = !car.isFeatured;
    await car.save();
    return res.status(200).json({ success: true, message: `Featured: ${car.isFeatured}`, car });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: toggle active ----

export async function toggleActive(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });
    car.isActive = !car.isActive;
    await car.save();
    return res.status(200).json({ success: true, message: `Active: ${car.isActive}`, car });
  } catch (e) {
    next(e);
  }
}

// ---- Admin: delete ----

export async function deleteCar(req, res, next) {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });
    return res.status(200).json({ success: true, message: "Car deleted." });
  } catch (e) {
    next(e);
  }
}