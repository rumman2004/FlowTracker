import express from "express";
import {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
} from "../Controllers/authcontroller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;