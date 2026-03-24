/**
 * HTTP Method Restriction Middleware
 * Ensures routes only accept the HTTP methods they are designed for
 * Part of OWASP security best practices
 */

import { Request, Response, NextFunction } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface MethodOptions {
  allowed?: readonly HttpMethod[] | HttpMethod[];
  required?: readonly HttpMethod[] | HttpMethod[];
  allowAll?: boolean;
}

const DEFAULT_ALLOWED_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/**
 * Middleware factory to restrict HTTP methods
 * @param options - Configuration for allowed/required methods
 * 
 * @example
 * // Only allow POST requests
 * router.post('/login', methodRestriction({ allowed: ['POST'] }), loginController);
 * 
 * @example
 * // Require specific methods (at least one must be present)
 * router.route('/users')
 *   .all(methodRestriction({ allowed: ['GET', 'POST'] }))
 *   .get(getUsers)
 *   .post(createUser);
 */
export const methodRestriction = (options: MethodOptions = {}) => {
  const { allowed = DEFAULT_ALLOWED_METHODS, allowAll = false } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method.toUpperCase() as HttpMethod;

    // Handle CORS pre-flight
    if (method === "OPTIONS") {
      res.setHeader("Allow", allowed.join(", "));
      res.setHeader("Access-Control-Allow-Methods", allowed.join(", "));
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.status(204).send();
      return;
    }

    // Check if method is allowed
    if (allowAll || allowed.includes(method)) {
      next();
      return;
    }

    // Method not allowed
    res.setHeader("Allow", allowed.join(", "));
    res.status(405).json({
      error: "Method Not Allowed",
      message: `The ${req.method} method is not allowed for this endpoint. Allowed methods: ${allowed.join(", ")}`,
      allowedMethods: allowed,
    });
  };
};

/**
 * Create route-level method restriction
 * Returns 404 for unsupported methods (more secure - doesn't reveal route exists)
 */
export const strictMethodRestriction = (allowed: HttpMethod[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method.toUpperCase() as HttpMethod;

    // Handle CORS pre-flight
    if (method === "OPTIONS") {
      res.setHeader("Allow", allowed.join(", "));
      res.setHeader("Access-Control-Allow-Methods", allowed.join(", "));
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.status(204).send();
      return;
    }

    if (!allowed.includes(method)) {
      // Return 404 for security - don't reveal the route exists
      res.status(404).json({
        error: "Not Found",
        message: "The requested endpoint does not exist",
      });
      return;
    }

    next();
  };
};

/**
 * Require exactly one HTTP method
 */
export const requireMethod = (method: HttpMethod) => {
  return strictMethodRestriction([method]);
};

/**
 * Require multiple HTTP methods (route with multiple handlers)
 */
export const requireMethods = (...methods: HttpMethod[]) => {
  return strictMethodRestriction(methods);
};

/**
 * Pre-flight handler for CORS
 * Use this for routes that need explicit OPTIONS handling
 */
export const handlePreflight = (allowedMethods: readonly HttpMethod[] | HttpMethod[] = ["GET", "POST", "OPTIONS"]) => {
  return (_req: Request, res: Response): void => {
    const methods = [...allowedMethods];
    res.setHeader("Allow", methods.join(", "));
    res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    res.status(204).send();
  };
};

/**
 * Common method configurations for reuse
 */
export const MethodConfig = {
  // RESTful resource endpoints
  resource: {
    create: ["POST"],
    read: ["GET"],
    update: ["PUT", "PATCH"],
    delete: ["DELETE"],
    list: ["GET"],
    detail: ["GET"],
  },
  
  // Authentication endpoints
  auth: {
    login: ["POST"],
    register: ["POST"],
    logout: ["POST"],
    refresh: ["POST"],
    verify: ["POST"],
    forgotPassword: ["POST"],
    resetPassword: ["POST"],
    changePassword: ["POST"],
  },
  
  // SSE endpoints
  sse: {
    stream: ["GET"],
    connections: ["GET"],
  },
  
  // Admin endpoints
  admin: {
    list: ["GET"],
    create: ["POST"],
    update: ["PUT", "PATCH"],
    delete: ["DELETE"],
  },
} as const;
