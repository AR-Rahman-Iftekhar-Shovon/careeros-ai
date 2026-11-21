// src/api.js — single place for all backend calls

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const getToken = () => localStorage.getItem("careeros_token");

export const setToken = (token) => localStorage.setItem("careeros_token", token);

export const clearAuth = () => {
  localStorage.removeItem("careeros_token");
  localStorage.removeItem("careeros_user");
};

/**
 * Central fetch wrapper.
 * - attaches JWT
 * - unwraps backend's { success, data } envelope
 * - throws Error(message) on failure
 * - auto-logout on 401
 */
export async function apiFetch(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  const token = getToken();
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, options);
  } catch {
    throw new Error("Cannot reach server. Please check your connection.");
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    if (window.location.pathname !== "/login") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }

  return json && json.data !== undefined ? json.data : json;
}

// Convenience helpers
export const apiGet = (endpoint) => apiFetch(endpoint, "GET");
export const apiPost = (endpoint, body) => apiFetch(endpoint, "POST", body);