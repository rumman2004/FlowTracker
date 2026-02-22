import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./Config/db.js";
import authRoutes from "./Routes/authroutes.js";
import habitRoutes from "./Routes/habitroutes.js";
import userRoutes from "./Routes/userroutes.js";
import adminRoutes from "./Routes/adminroutes.js";
import { scheduleDailyReset } from "./Utils/scheduler.js";

// ── Load env ──────────────────────────────────────────────────────────────────
dotenv.config();

// ── Validate required env vars ────────────────────────────────────────────────
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRE",
  "CLIENT_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`❌ Missing required environment variables:\n  → ${missingEnv.join("\n  → ")}`);
  process.exit(1);
}

// ── Connect DB ────────────────────────────────────────────────────────────────
await connectDB();

// ── App setup ─────────────────────────────────────────────────────────────────
const app    = express();
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary images
    contentSecurityPolicy: isProd ? undefined : false,     // relaxed in dev
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// Supports multiple origins: CLIENT_URL=https://a.com,https://b.com
const allowedOrigins = process.env.CLIENT_URL
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / Postman (no origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin "${origin}" is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── HTTP logging ──────────────────────────────────────────────────────────────
app.use(morgan(isProd ? "combined" : "dev"));

// ── Trust proxy ───────────────────────────────────────────────────────────────
// Required for Render / Railway / Heroku so rate-limiting reads real IPs
app.set("trust proxy", 1);

// ── Rate limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 min
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many requests — please try again later.",
  },
});

// Strict limiter for login / register / admin login
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 min
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many auth attempts — please wait 15 minutes.",
  },
});

app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",   authLimiter, authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/user",   userRoutes);
app.use("/api/admin",  adminRoutes);

// ── Root & health check ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flow-Tracker API is running 🚀",
    version: process.env.npm_package_version || "1.0.0",
    env:     process.env.NODE_ENV || "development",
    uptime:  `${Math.floor(process.uptime())}s`,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success:   true,
    status:    "healthy",
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    memory:    process.memoryUsage(),
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "missing",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS block
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(409).json({
      success: false,
      message: `${label} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired — please log in again",
    });
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body too large (max 10kb)",
    });
  }

  // Cloudinary errors
  if (err.http_code) {
    return res.status(err.http_code).json({
      success: false,
      message: `Cloudinary error: ${err.message}`,
    });
  }

  // Fallback
  const statusCode = err.statusCode || err.status || 500;
  const message    = isProd && statusCode === 500
    ? "Internal server error"
    : err.message || "Internal server error";

  if (statusCode === 500) {
    console.error("🔥 Server Error:", {
      message: err.message,
      stack:   isProd ? undefined : err.stack,
      path:    req.originalUrl,
      method:  req.method,
    });
  }

  res.status(statusCode).json({ success: false, message });
});

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log(`✅ Server     : http://localhost:${PORT}`);
  console.log(`📦 Database   : ${process.env.MONGODB_URI.split("@")[1]?.split("/")[0] ?? "connected"}`);
  console.log(`🌍 Client URL : ${process.env.CLIENT_URL}`);
  console.log(`☁️  Cloudinary : ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`🔐 Admin      : ${process.env.ADMIN_EMAIL}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("─────────────────────────────────────────");

  scheduleDailyReset();
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log("✅ HTTP server closed cleanly");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("❌ Forced exit after 10s timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM")); // Render / Railway send this
process.on("SIGINT",  () => shutdown("SIGINT"));  // Ctrl+C in terminal

// ── Catch unhandled errors ────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  shutdown("uncaughtException");
});

export default app;