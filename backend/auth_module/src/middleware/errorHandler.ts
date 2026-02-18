import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "../types";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let details: any = null;

  // Handle custom API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Prisma errors
  else if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;

    switch (prismaError.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        details = { field: prismaError.meta?.target?.[0] };
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid foreign key reference";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
    }
  }
  // Handle validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = error.message;
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  // Handle syntax errors
  else if (error instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON";
  }
  // Handle other known errors
  else if (error.message) {
    message = error.message;
  }

  // Log error for debugging (in production, use proper logging)
  if (process.env["NODE_ENV"] !== "production") {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }

  // In production, do not leak probed path for 404 (security: avoid helping scanners)
  const isProduction = process.env["NODE_ENV"] === "production";
  const safePath = isProduction && statusCode === 404 ? "/api/..." : req.originalUrl;
  const safeMessage = isProduction && statusCode === 404 ? "Not found" : message;

  // Send standardized error response
  const errorResponse: ApiErrorResponse = {
    error: safeMessage,
    message: safeMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    path: safePath,
  };

  if (details) {
    errorResponse.details = details;
  }

  // Include stack trace in development
  if (process.env["NODE_ENV"] === "development") {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for unmatched routes.
 * In production, use a generic message to avoid leaking probed paths to scanners.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  _next: NextFunction
): void {
  const message =
    process.env["NODE_ENV"] === "production"
      ? "Not found"
      : `Route ${req.originalUrl} not found`;
  const error = new ApiError(message, 404);
  _next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch unhandled promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
