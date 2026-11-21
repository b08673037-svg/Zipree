// frontend/myapp/src/lib/fleetApi.js
import { api } from "./apiClient.js";

/**
 * Fetch 3 featured cars for the homepage editorial section.
 * Sorted by rating average so the best cars show first.
 */
export async function getFeaturedCars(category = "") {
  let query = "/cars?limit=3&sort=-ratingAverage";
  
  if (category && category !== "all") {
    query += `&category=${category}`;
  }
  
  const res = await api.get(query);
  return res.cars;
}

/**
 * Fetch all cars for the main Fleet Listing page.
 * Handles all filters, sorting, and pagination.
 */
export async function getAllCars(filters = {}) {
  const params = new URLSearchParams();
  
  // Add any active filters to the URL
  if (filters.category && filters.category !== "all") params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);
  if (filters.transmission) params.append("transmission", filters.transmission);
  if (filters.fuel) params.append("fuel", filters.fuel);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.sort) params.append("sort", filters.sort);
  
  // Pagination (defaults to page 1, 9 cars per page)
  params.append("page", filters.page || 1);
  params.append("limit", filters.limit || 9);

  const res = await api.get(`/cars?${params.toString()}`);
  
  // Returns the full response so pagination components can use count/total/pages
  return res; 
}

/**
 * Fetch a single car by its MongoDB ID.
 * Used for the Vehicle Detail Page.
 */
export async function getCarById(carId) {
  const res = await api.get(`/cars/${carId}`);
  return res.car;
}