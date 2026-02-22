import jwt from "jsonwebtoken";

// ── User token ────────────────────────────────────────────────────────────────
export const generateToken = (id) => {
  return jwt.sign(
    { id, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ── Admin token ───────────────────────────────────────────────────────────────
export const generateAdminToken = (email) => {
  return jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

export default generateToken;