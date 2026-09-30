// Single source of truth for the API base URL.
// Set VITE_API_URL per environment; falls back to the local backend.
// Trailing slashes are stripped so `${API_BASE_URL}/tasks` never gives `//tasks`.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");
