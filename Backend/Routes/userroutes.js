import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateSettings,
  deleteAccount,
  getWeeklyProgress,
  getMonthlyProgress,
  getExpHistory,
  getLeaderboard,
} from "../Controllers/usercontroller.js";
import { protect } from "../Middleware/authmiddleware.js";
import { upload } from "../Middleware/uploadmiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", upload.single("profilePic"), updateProfile);
router.put("/change-password", changePassword);
router.put("/settings", updateSettings);
router.delete("/account", deleteAccount);
router.get("/weekly-progress", getWeeklyProgress);
router.get("/monthly-progress", getMonthlyProgress);
router.get("/exp-history", getExpHistory);
router.get("/leaderboard", getLeaderboard);

export default router;