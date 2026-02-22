import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
} from "../Controllers/admincontroller.js";
import { protect, adminOnly } from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle", toggleUserStatus);

export default router;