import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import sectionItemRoutes from "./routes/sectionItemRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ensureAdminUser from "./config/ensureAdmin.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js"; // ✅ uncomment

dotenv.config();

// ✅ FIRST create app
const app = express();


// ✅ ENV VARIABLES
const PORT = process.env.PORT || 5000;
// Extra allowed origins for the live site, comma separated, e.g. CLIENT_URL=https://example.com,https://www.example.com
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];
let dbConnected = false;

// ✅ MIDDLEWARES
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ✅ LOGGER
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// console.log("Mongo URI:", process.env.MONGO_URI);

// ✅ ROUTES
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Garviks API is running",
    database: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/section-items", sectionItemRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin", adminRoutes);

// ✅ ERROR HANDLING (LAST)
app.use(notFound);
app.use(errorHandler);

// ✅ START SERVER
const startServer = async () => {
  try {
    dbConnected = await connectDB();
    if (!dbConnected) {
      console.warn("⚠️ Starting API without MongoDB connection.");
    } else {
      await ensureAdminUser();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please stop the process using this port or set a different PORT in your environment.`
        );
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
