// Routes/adminroutes.js

import express from "express";
import { isAdmin } from "../Middleware/authmiddleware.js";
import {
  getAdminDashboard,
  getAllUsers,
  toggleUserStatus,
} from "../Controllers/admincontroller.js";

const router = express.Router();

// All admin routes protected by isAdmin
router.get("/dashboard", isAdmin, getAdminDashboard);
router.get("/users",     isAdmin, getAllUsers);
router.patch("/users/:id/toggle", isAdmin, toggleUserStatus);

export default router;