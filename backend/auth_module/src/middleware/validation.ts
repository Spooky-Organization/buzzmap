import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { ApiErrorResponse } from "../types";

/**
 * Validation result handler
 * Checks for validation errors and returns them
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorResponse: ApiErrorResponse = {
      error: "Validation failed",
      message: "Validation failed",
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      details: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "unknown",
        message: error.msg,
        value: error.type === "field" ? error.value : undefined,
      })),
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  next();
}

/**
 * User registration validation
 */
export const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be between 1-50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be between 1-50 characters"),
  handleValidationErrors,
];

/**
 * User login validation
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

/**
 * Password reset request validation
 */
export const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  handleValidationErrors,
];

/**
 * Password reset validation
 */
export const validatePasswordReset = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

/**
 * Email verification validation
 */
export const validateEmailVerification = [
  body("token").notEmpty().withMessage("Verification token is required"),
  handleValidationErrors,
];

/**
 * User update validation
 */
export const validateUserUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1-50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1-50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  handleValidationErrors,
];

/**
 * Password change validation
 */
export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

/**
 * User ID parameter validation
 */
export const validateUserId = [
  param("userId").isUUID().withMessage("Valid user ID is required"),
  handleValidationErrors,
];

/**
 * Pagination query validation
 */
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

/**
 * Role assignment validation
 */
export const validateRoleAssignment = [
  body("role")
    .isIn(["USER", "ACCOUNTANT", "ADMIN"])
    .withMessage("Role must be USER, ACCOUNTANT, or ADMIN"),
  handleValidationErrors,
];
