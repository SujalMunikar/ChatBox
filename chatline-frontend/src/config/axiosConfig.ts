import axios from "axios";
import { BACKEND_URL } from "./urlConfig";

// Shared axios instance ensures all API calls share base config and auth headers.

const api = axios.create({
  baseURL: BACKEND_URL || "http://localhost:8000", // Fallback if env is undefined
  withCredentials: true,
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

let hasHandledAuthError = false;
const AUTH_BYPASS_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/reset-password",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && typeof window !== "undefined") {
      const requestUrl = (error?.config?.url as string) ?? "";
      const shouldBypass = AUTH_BYPASS_ENDPOINTS.some((path) =>
        requestUrl.includes(path)
      );
      const alreadyOnLogin = window.location.pathname === "/login";

      if (!shouldBypass && !alreadyOnLogin && !hasHandledAuthError) {
        // Clear all persisted auth exactly once, then push the user back to the login screen for a fresh session.
        hasHandledAuthError = true;
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
