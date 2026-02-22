import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const token = user?.token || admin?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;