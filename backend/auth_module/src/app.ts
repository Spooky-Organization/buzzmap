import express from "express";
import cors from "cors";
import helmet from "helmet";

// Import custom middleware
import { errorHandler, notFoundHandler, generalLimiter, sanitizeAll } from "./middleware";
import { performanceMonitor } from "./utils/performanceMonitor";

// Import routes
import { 
  authRoutesV1, 
  userRoutesV1, 
  mfaRoutesV1, 
  performanceRoutesV1
} from "./routes";

// Import environment validation
import { getEnv } from "./utils/envValidation";

const app = express();

// Middleware: JSON body parsing
app.use(express.json({ limit: "10mb" }));

// Middleware: URL encoding
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: CORS
app.use(
  cors({
    origin: getEnv('CORS_ORIGIN'),
    credentials: true,
  })
);

// Middleware: Security headers
app.use(helmet());

// Middleware: General rate limiting
app.use(generalLimiter);

// Middleware: Input sanitization
app.use(sanitizeAll);

// Middleware: Performance monitoring
app.use(performanceMonitor);

// Health check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: getEnv('NODE_ENV'),
  });
});

// API Routes - Versioned
app.use("/api/v1/auth", authRoutesV1);
app.use("/api/v1/users", userRoutesV1);
app.use("/api/v1/auth/mfa", mfaRoutesV1);
app.use("/api/v1/admin/performance", performanceRoutesV1);

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
