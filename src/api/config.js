// src/api/config.js
// In development, Vite proxies /api to Express (see vite.config.js).
// Production builds bake the deployed backend URL in through VITE_BACKEND_URL.
export const baseUrl = import.meta.env.VITE_BACKEND_URL || '/api/v1';

// Turn a failed response into an Error carrying the backend's message
export async function readError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  return new Error(body.error || `${fallback} (${response.status})`);
}
