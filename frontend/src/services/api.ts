import axios from "axios";

// Central Cloud Backend URL (used by Android APK, iOS, PWA, and Web)
export const PRODUCTION_API_URL = "https://transport-erp-gjf2.onrender.com/api/v1";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = String(import.meta.env.VITE_API_URL).trim().replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  const customUrl = typeof window !== "undefined" ? localStorage.getItem("custom_api_url") : null;
  if (customUrl) {
    const raw = customUrl.trim().replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  // On all mobile devices, APK installations, PWAs, and web:
  // Connect directly to the production cloud backend so all devices share the exact same database!
  return PRODUCTION_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60000 // 60s timeout to allow Render free tier to wake up smoothly
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Don't wipe session if user merely typed the wrong password on login/register
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organization");
        localStorage.removeItem("role");
        localStorage.removeItem("permissions");
      }
    }
    return Promise.reject(error);
  }
);

export default api;