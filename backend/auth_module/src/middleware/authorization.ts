import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userRole = req.user.role as UserRole;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: "Insufficient permissions",
        required: roles,
        current: userRole,
      });
      return;
    }

    next();
  };
}

/**
 * Admin-only middleware
 * Only allows ADMIN role access
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requireRole(UserRole.ADMIN)(req, res, next);
}

/**
 * Admin or Accountant middleware
 * Allows ADMIN and ACCOUNTANT role access
 */
export function requireAdminOrAccountant(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT])(req, res, next);
}

/**
 * Any authenticated user middleware
 * Allows any authenticated user (USER, ACCOUNTANT, ADMIN)
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

/**
 * Resource ownership middleware
 * Checks if user owns the resource or is admin
 */
export function requireOwnershipOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userRole = req.user.role as UserRole;
  const resourceUserId = req.params["userId"] || req.body["userId"];

  // Admin can access any resource
  if (userRole === UserRole.ADMIN) {
    next();
    return;
  }

  // User can only access their own resources
  if (req.user.id === resourceUserId) {
    next();
    return;
  }

  res.status(403).json({ error: "Access denied to this resource" });
}
