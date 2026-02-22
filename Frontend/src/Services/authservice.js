import API from "./api.js";

// ── User auth ─────────────────────────────────────────────────────────────────
export const loginUser    = (data) => API.post("/auth/login",       data);
export const registerUser = (data) => API.post("/auth/register",    data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
// ── Admin auth ────────────────────────────────────────────────────────────────
export const loginAdmin   = (data) => API.post("/auth/admin/login", data);