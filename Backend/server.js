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
  console.error(
    `❌ Missing required environment variables:\n  → ${missingEnv.join("\n  → ")}`
  );
  process.exit(1);
}

// ── Connect DB ────────────────────────────────────────────────────────────────
// ✅ FIX 1: Top-level await is unreliable on some hosts — wrap in async start()
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  // ── App setup ───────────────────────────────────────────────────────────────
  const app    = express();
  const PORT   = process.env.PORT || 5000;
  const isProd = process.env.NODE_ENV === "production";

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      // ✅ FIX 2: crossOriginResourcePolicy must be lowercase "cross-origin"
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: isProd ? undefined : false,
    })
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  // ✅ FIX 3: Support multiple comma-separated CLIENT_URLs
  const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server / curl / Postman (no origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // ✅ FIX 4: Don't throw — return proper CORS error so it reaches handler
        return callback(
          Object.assign(new Error(`CORS: Origin "${origin}" not allowed`), {
            status: 403,
          })
        );
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ FIX 5: Explicitly handle pre-flight OPTIONS for all routes
  app.options("*", cors());

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Body parsers ────────────────────────────────────────────────────────────
  // ✅ FIX 6: Increase JSON limit to 50kb — profile pic base64 blobs exceed 10kb
  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));
  app.use(cookieParser());

  // ── HTTP logging ────────────────────────────────────────────────────────────
  app.use(morgan(isProd ? "combined" : "dev"));

  // ── Trust proxy ─────────────────────────────────────────────────────────────
  // Required for Render / Railway / Heroku — reads real client IP
  app.set("trust proxy", 1);

  // ── Rate limiters ───────────────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs:        15 * 60 * 1000,
    max:             300,
    standardHeaders: true,
    legacyHeaders:   false,
    // ✅ FIX 7: skip() prevents rate-limiting health-check pings
    skip: (req) => req.path === "/health",
    message: {
      success: false,
      message: "Too many requests — please try again later.",
    },
  });

  const authLimiter = rateLimit({
    windowMs:        15 * 60 * 1000,
    max:             20,
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
      success: false,
      message: "Too many auth attempts — please wait 15 minutes.",
    },
  });

  app.use(globalLimiter);

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use("/api/auth",   authLimiter, authRoutes);
  app.use("/api/habits", habitRoutes);
  app.use("/api/user",   userRoutes);
  app.use("/api/admin",  adminRoutes);

  // ── Root & health ────────────────────────────────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Flow-Tracker API is running 🚀",
      version: process.env.npm_package_version || "1.0.0",
      env:     process.env.NODE_ENV || "development",
      uptime:  `${Math.floor(process.uptime())}s`,
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success:    true,
      status:     "healthy",
      timestamp:  new Date().toISOString(),
      uptime:     `${Math.floor(process.uptime())}s`,
      memory:     process.memoryUsage(),
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "missing",
    });
  });

  // ── 404 ─────────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  // ── Global error handler ─────────────────────────────────────────────────────
  // ✅ FIX 8: Must have exactly 4 params for Express to treat as error middleware
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // CORS block
    if (err.message?.startsWith("CORS")) {
      return res.status(403).json({ success: false, message: err.message });
    }

    // Mongoose validation
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }

    // Duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      return res
        .status(409)
        .json({ success: false, message: `${label} already exists` });
    }

    // Cast error (bad ObjectId)
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${err.path}: ${err.value}`,
      });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
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
        message: "Request body too large",
      });
    }

    // Cloudinary errors
    if (err.http_code) {
      return res.status(err.http_code).json({
        success: false,
        message: `Cloudinary error: ${err.message}`,
      });
    }

    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ success: false, message: "File too large" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ success: false, message: "Unexpected file field" });
    }

    // Fallback
    const statusCode = err.statusCode || err.status || 500;
    const message =
      isProd && statusCode === 500
        ? "Internal server error"
        : err.message || "Internal server error";

    if (statusCode >= 500) {
      console.error("🔥 Server Error:", {
        message: err.message,
        stack:   isProd ? undefined : err.stack,
        path:    req.originalUrl,
        method:  req.method,
      });
    }

    res.status(statusCode).json({ success: false, message });
  });

  // ── Start listening ──────────────────────────────────────────────────────────
  const server = app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`✅ Server     : http://localhost:${PORT}`);
    console.log(
      `📦 Database   : ${
        process.env.MONGODB_URI.split("@")[1]?.split("/")[0] ?? "connected"
      }`
    );
    console.log(`🌍 Client URL : ${process.env.CLIENT_URL}`);
    console.log(`☁️  Cloudinary : ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`🔐 Admin      : ${process.env.ADMIN_EMAIL}`);
    console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("─────────────────────────────────────────────");

    // ✅ FIX 9: Schedule inside listen callback — guarantees DB is ready first
    scheduleDailyReset();
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
    server.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });
    // Force exit if graceful close hangs
    setTimeout(() => {
      console.error("❌ Forced exit after 10s");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
};

// ── Catch unhandled errors ────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

// ── Boot ──────────────────────────────────────────────────────────────────────
startServer();