import jwt from "jsonwebtoken";
import User from "../Models/Usermodel.js";

// ── protect: verify user JWT ──────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized — no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Block admin tokens from accessing user routes
    if (decoded.role === "admin") {
      return res.status(403).json({ message: "Admin token cannot access user routes" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired — please log in again" });
    }
    return res.status(401).json({ message: "Not authorized — invalid token" });
  }
};

// ── isAdmin: verify admin JWT ─────────────────────────────────────────────────
// ✅ FIX: checks decoded.role === "admin" and decoded.email === ADMIN_EMAIL
export const isAdmin = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(403).json({ message: "Access denied — no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Must have role: "admin" AND matching email
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied — not an admin token" });
    }

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Access denied — admin email mismatch" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Admin session expired — please log in again" });
    }
    return res.status(403).json({ message: "Access denied — invalid token" });
  }
};