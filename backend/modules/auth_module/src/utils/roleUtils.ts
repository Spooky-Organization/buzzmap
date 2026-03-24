import { UserRole } from "@/types";

/**
 * Check if a user has a specific role
 * @param userRole - The user's role
 * @param requiredRole - The required role
 * @returns boolean
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Check if a user has any of the allowed roles
 * @param userRole - The user's role
 * @param allowedRoles - Array of allowed roles
 * @returns boolean
 */
export function hasAnyRole(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if a user is an admin
 * @param userRole - The user's role
 * @returns boolean
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === "ADMIN";
}

/**
 * Check if a user is an accountant
 * @param userRole - The user's role
 * @returns boolean
 */
export function isAccountant(userRole: UserRole): boolean {
  return userRole === "ACCOUNTANT";
}

/**
 * Check if a user is a regular user
 * @param userRole - The user's role
 * @returns boolean
 */
export function isRegularUser(userRole: UserRole): boolean {
  return userRole === "USER";
}
