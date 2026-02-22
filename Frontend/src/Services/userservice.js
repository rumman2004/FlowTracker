import API from "./api.js";

export const getProfile = () => API.get("/user/profile");
export const updateProfile = (data) =>
  API.put("/user/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const changePassword = (data) => API.put("/user/change-password", data);
export const updateSettings = (data) => API.put("/user/settings", data);
export const deleteAccount = () => API.delete("/user/account");
export const getWeeklyProgress = () => API.get("/user/weekly-progress");
export const getMonthlyProgress = () => API.get("/user/monthly-progress");
export const getExpHistory = () => API.get("/user/exp-history");
export const getLeaderboard = () => API.get("/user/leaderboard");