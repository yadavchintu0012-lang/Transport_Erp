import axios from "axios";

// Automatically resolve backend URL for Web, PWA, or Android APK
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
  // If running in Android / iOS native Capacitor wrapper
  if (typeof window !== "undefined") {
    if (window.location.protocol === "capacitor:" || (window as any).Capacitor?.isNativePlatform?.()) {
      return "https://transportproo.netlify.app/api/v1";
    }
  }
  // Standard Web deployment (Netlify, Cloudflare Pages, Vite Dev, etc.) uses relative proxy
  return "/api/v1";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  }
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;