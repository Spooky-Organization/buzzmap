import { Request, Response, NextFunction } from "express";
import xss from "xss";
import validator from "validator";

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== "string") {
    return input;
  }
  
  // First escape HTML entities
  const escaped = validator.escape(input);
  
  // Then apply XSS filtering
  const sanitized = xss(escaped, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
  
  return sanitized.trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize request query parameters
 */
export const sanitizeQuery = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Middleware to sanitize request parameters
 */
export const sanitizeParams = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Comprehensive sanitization middleware
 * Sanitizes body, query, and params
 */
export const sanitizeAll = (req: Request, res: Response, next: NextFunction): void => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};

/**
 * Email-specific sanitization
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== "string") {
    return email;
  }
  
  // Normalize email and remove any potential XSS
  const normalized = validator.normalizeEmail(email);
  if (!normalized) {
    return email; // Return original if normalization fails
  }
  
  return sanitizeString(normalized);
};

/**
 * Password-specific sanitization (minimal to avoid breaking passwords)
 */
export const sanitizePassword = (password: string): string => {
  if (typeof password !== "string") {
    return password;
  }
  
  // Only trim whitespace, don't escape special characters
  // as they might be intentional in passwords
  return password.trim();
};

/**
 * Name-specific sanitization
 */
export const sanitizeName = (name: string): string => {
  if (typeof name !== "string") {
    return name;
  }
  
  // Remove HTML tags and scripts, but preserve basic formatting
  const sanitized = xss(name, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
  
  // Remove excessive whitespace
  return sanitized.replace(/\s+/g, " ").trim();
};

/**
 * Token-specific sanitization
 */
export const sanitizeToken = (token: string): string => {
  if (typeof token !== "string") {
    return token;
  }
  
  // Remove any non-alphanumeric characters except hyphens and underscores
  return token.replace(/[^a-zA-Z0-9\-_]/g, "");
};

/**
 * Rate limiting key sanitization
 */
export const sanitizeRateLimitKey = (key: string): string => {
  if (typeof key !== "string") {
    return key;
  }
  
  // Only allow alphanumeric characters, dots, and colons
  return key.replace(/[^a-zA-Z0-9.:]/g, "");
};
