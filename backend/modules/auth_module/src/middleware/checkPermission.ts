import { Request, Response, NextFunction } from "express";
import { ApiError } from "./index";
import { Permission, hasPermission } from "../permissions";
import { UserRole } from "../../../shared/types";

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role as UserRole;
    if (!role) {
      throw new ApiError("Authentication required", 401);
    }

    if (!hasPermission(role, permission)) {
      throw new ApiError("You do not have permission to perform this action", 403);
    }

    next();
  };
}
