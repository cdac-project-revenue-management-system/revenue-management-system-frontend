// ==========================================
// API Configuration
// Base axios instance and interceptors
// ==========================================

import axios from "axios";

// TODO: Replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// Request Interceptor
// Add authentication token to requests
// ==========================================
api.interceptors.request.use(
  (config) => {
    // TODO: Get auth token from your auth provider (localStorage, context, etc.)
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// Response Interceptor
// Handle common response scenarios
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401 unauthorized, 500 server errors, etc.)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
