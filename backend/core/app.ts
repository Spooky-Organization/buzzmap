import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

// Import custom middleware
import { errorHandler, notFoundHandler, generalLimiter, sanitizeAll } from "../modules/auth_module/src/middleware";
import { performanceMonitor } from "../modules/auth_module/src/utils/performanceMonitor";

// Import routes
import {
  authRoutesV1,
  userRoutesV1,
  mfaRoutesV1,
  performanceRoutesV1,
  sseRoutesV1,
  handshakeRoute,
} from "../modules/auth_module/src/routes";

// Import encryption middleware
import { payloadEncryption } from "../modules/auth_module/src/middleware/payloadEncryption";

// Import environment validation
import { getEnv } from "../modules/auth_module/src/utils/envValidation";

const app = express();

// Trust proxy: Enable when behind reverse proxy (nginx, Cloudflare, Coolify, etc.)
// This allows Express to trust X-Forwarded-* headers from the proxy
app.set('trust proxy', 1);

// Middleware: JSON body parsing with size limit
app.use(express.json({ limit: "10mb" }));

// Middleware: URL encoding with size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: CORS with strict configuration
app.use(
  cors({
    origin: getEnv('CORS_ORIGIN'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  })
);

// Middleware: Enhanced Security headers (OWASP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", getEnv('CORS_ORIGIN'), `http://localhost:${getEnv('PORT')}`],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    // API server is accessed cross-origin (frontend on a different port/domain).
    // "same-origin" would instruct the browser to block cross-origin reads of
    // API responses — including SSE body streaming — even when CORS allows them.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  })
);

// Middleware: Response compression (Phase 6 - Performance)
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    // EventSource always sends Accept: text/event-stream.
    // Gzip buffers output until the buffer fills (default ~16 KB). SSE heartbeats
    // and events are tiny and never reach that threshold, so compressed data sits
    // in the gzip buffer forever and the browser receives nothing — causing
    // EventSource to fire onerror and show "Disconnected".
    if ((req.headers["accept"] as string | undefined)?.includes("text/event-stream")) return false;
    return compression.filter(req, res);
  },
  level: 6,
}));

// Middleware: General rate limiting
app.use(generalLimiter);

// Handshake route — MUST be before sanitizeAll because the request body
// contains raw ECDH public key bytes (base64url), not user-supplied text.
// validator.escape() and xss() can corrupt binary-encoded strings.
app.use("/api/handshake", handshakeRoute);

// Middleware: Input sanitization
app.use(sanitizeAll);

// Middleware: Performance monitoring
app.use(performanceMonitor);

// Middleware: Payload encryption/decryption (ECDH session-based AES-256-GCM)
// Must come after body parsing and sanitization, before route handlers
app.use(payloadEncryption);

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
app.use("/api/v1/sse", sseRoutesV1);

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
