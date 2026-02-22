import API from "./api.js";

export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAllUsers = () => API.get("/admin/users");
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/toggle`);