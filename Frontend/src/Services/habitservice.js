import API from "./api.js";

export const getHabits = () => API.get("/habits");
export const createHabit = (data) => API.post("/habits", data);
export const updateHabit = (id, data) => API.put(`/habits/${id}`, data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const toggleHabit = (id) => API.patch(`/habits/${id}/toggle`);
export const getTodayProgress = () => API.get("/habits/today-progress");