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
    const token = localStorage.getItem("token") as string;
    // Attach auth token if we have one so backend can authorize the request.
    // Assuming you store the token in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
