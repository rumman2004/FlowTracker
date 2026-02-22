import { useState, useEffect } from "react";
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit,
} from "../Services/habitservice.js";
import toast from "react-hot-toast";

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const { data } = await getHabits();
      setHabits(data);
    } catch (error) {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async (habitData) => {
    try {
      const { data } = await createHabit(habitData);
      setHabits((prev) => [data, ...prev]);
      toast.success("Habit created!");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create habit");
    }
  };

  const editHabit = async (id, habitData) => {
    try {
      const { data } = await updateHabit(id, habitData);
      setHabits((prev) => prev.map((h) => (h._id === id ? data : h)));
      toast.success("Habit updated!");
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const removeHabit = async (id) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      toast.success("Habit deleted");
    } catch (error) {
      toast.error("Failed to delete habit");
    }
  };

  const toggle = async (id) => {
    try {
      const { data } = await toggleHabit(id);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? data.habit : h))
      );
      return data.user;
    } catch (error) {
      toast.error("Failed to toggle habit");
    }
  };

  return { habits, loading, addHabit, editHabit, removeHabit, toggle, fetchHabits };
};