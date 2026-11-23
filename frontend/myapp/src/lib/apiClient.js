// ZIPREE — API client
// Lightweight fetch wrapper. Reads VITE_API_URL, attaches JWT if present,
// normalizes error responses into thrown ApiError instances.

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "zipree_token";

export class ApiError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

async function request(path, { method = "GET", body, headers = {}, signal } = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getToken();

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
          ? body
          : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Network error. Please try again.", 0);
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text };
    }
  }

  if (!response.ok) {
    const message =
      (data && data.message) || `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

// Named export — this is what AuthContext.jsx is looking for
export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};