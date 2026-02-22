import User from "../Models/Usermodel.js";
import generateToken, { generateAdminToken } from "../Utils/generateToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// @desc Register user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      level:      user.level,
      exp:        user.exp,
      profilePic: user.profilePic,
      token:      generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    res.json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      level:      user.level,
      exp:        user.exp,
      totalExp:   user.totalExp,
      profilePic: user.profilePic,
      streak:     user.streak,
      theme:      user.theme,
      token:      generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Login
// ✅ FIX: use generateAdminToken which embeds { email, role: "admin" }
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (
      email    !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // ✅ Token now contains { email, role: "admin" }
    const token = generateAdminToken(email);

    res.json({
      success: true,
      isAdmin: true,
      email,
      name:  "Admin",
      role:  "admin",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({
      message:    "Password reset token generated",
      resetToken, // ⚠️ Remove this in production — send via email instead
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpire:  { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};