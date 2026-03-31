// Authentication middleware
export { authenticateToken, optionalAuth } from "./auth";
export { authenticateToken as auth } from "./auth"; // Alias for authenticateToken

// Authorization middleware
export {
  requireRole,
  requireAdmin,
  requireAdminOrAccountant,
  requireAuth,
  requireOwnershipOrAdmin,
  requirePermission,
} from "./authorization";
export { requirePermission as checkPermission } from "./checkPermission";

// Method restriction middleware
export {
  methodRestriction,
  strictMethodRestriction,
  requireMethod,
  requireMethods,
  handlePreflight,
  MethodConfig,
  type HttpMethod,
  type MethodOptions,
} from "./methodRestriction";

// Validation middleware
export {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateUserUpdate,
  validatePasswordChange,
  validateUserId,
  validatePagination,
  validateRoleAssignment,
} from "./validation";
export { handleValidationErrors as validate } from "./validation"; // Alias for handleValidationErrors

// Error handling middleware
export {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from "./errorHandler";

// Rate limiting middleware
export {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  adminLimiter,
} from "./rateLimiter";

// Sanitization middleware
export {
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll,
  sanitizeString,
  sanitizeEmail,
  sanitizePassword,
  sanitizeName,
  sanitizeToken,
  sanitizeRateLimitKey,
} from "./sanitization";
