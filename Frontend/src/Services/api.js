import axios from "axios";

const API = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Attach correct token based on route ───────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url?.includes("/admin");

    if (isAdminRoute) {
      // ✅ Admin routes always use adminToken
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");
      if (admin?.token) {
        config.headers.Authorization = `Bearer ${admin.token}`;
      }
    } else {
      // ✅ User routes use user token
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 / 403 globally ─────────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status     = error.response?.status;
    const isAdminUrl = error.config?.url?.includes("/admin");

    if (status === 401 || status === 403) {
      if (isAdminUrl) {
        // Clear admin session and redirect to admin login
        localStorage.removeItem("admin");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      } else {
        // Clear user session
        localStorage.removeItem("user");
      }
    }

    return Promise.reject(error);
  }
);

export default API;