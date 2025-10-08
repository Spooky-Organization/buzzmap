import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ApiErrorResponse } from "../types";
import { verifyAccessToken } from "../config/jwt";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "Access token required",
        message: "Access token required",
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Verify token using proper JWT verification
    const decoded = verifyAccessToken(token);
    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not found",
        message: "User not found",
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    let errorResponse: ApiErrorResponse;
    
    if (error instanceof Error) {
      if (error.message === "Invalid token" || error.message === "Invalid token type") {
        errorResponse = {
          error: "Invalid token",
          message: "Invalid token",
          statusCode: 401,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        };
        res.status(401).json(errorResponse);
      } else if (error.message === "Token expired") {
        errorResponse = {
          error: "Token expired",
          message: "Token expired",
          statusCode: 401,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        };
        res.status(401).json(errorResponse);
      } else {
        console.error("Authentication error:", error);
        errorResponse = {
          error: "Authentication failed",
          message: "Authentication failed",
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        };
        res.status(500).json(errorResponse);
      }
    } else {
      console.error("Authentication error:", error);
      errorResponse = {
        error: "Authentication failed",
        message: "Authentication failed",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };
      res.status(500).json(errorResponse);
    }
  }
}

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't require token
 * Useful for endpoints that work with or without authentication
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without user data
      next();
      return;
    }

    // Try to verify token using proper JWT verification
    const decoded = verifyAccessToken(token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Token is invalid, but we continue without user data
    next();
  }
}
