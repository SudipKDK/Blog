/**
 * Main Application Entry Point
 * Organized and clean server setup
 */

import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";

// Import middleware
import { checkForAuthenticationCookie } from "./middleware/authentication.js";
import { globalErrorHandler, notFound } from "./middleware/errorHandler.js";

// Import config
import { config } from "./config/config.js";

const app = express();
const PORT = config.PORT;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration for API
app.use('/api', cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Authentication middleware
app.use(checkForAuthenticationCookie("token"));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// ============================================================================
// STATIC FILES
// ============================================================================

// Serve static files (frontend and uploads)
app.use(express.static(path.resolve("./public")));
app.use(express.static(path.resolve("./frontend")));

// ============================================================================
// ROUTES
// ============================================================================

// API routes (JSON responses)
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Frontend available at: http://localhost:${PORT}/index.html`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
