import express from "express";
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit,
  getTodayProgress,
} from "../Controllers/habitcontroller.js";
import { protect } from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

// ✅ CRITICAL FIX: Static routes MUST come before dynamic /:id routes
// If /today-progress is placed after /:id, Express will treat
// "today-progress" as an ID string and call the wrong controller
router.get("/today-progress", getTodayProgress);

// General routes
router.get("/", getHabits);
router.post("/", createHabit);

// Dynamic ID routes (must be LAST)
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.patch("/:id/toggle", toggleHabit);

export default router;