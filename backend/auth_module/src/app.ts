import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import custom middleware
import { errorHandler, notFoundHandler, generalLimiter } from "./middleware";

// Import routes
import { authRoutes, userRoutes } from "./routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware: JSON body parsing
app.use(express.json({ limit: "10mb" }));

// Middleware: URL encoding
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: CORS
app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] || "*",
    credentials: true,
  })
);

// Middleware: Security headers
app.use(helmet());

// Middleware: General rate limiting
app.use(generalLimiter);

// Health check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
