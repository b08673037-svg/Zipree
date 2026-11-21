// If VITE_API_URL is set (in Vercel), use it. Otherwise, fallback to proxy for local dev.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";