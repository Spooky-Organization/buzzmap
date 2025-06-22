import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  changePassword,
} from "../controllers/authController";

import {
  authenticateToken,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validatePasswordChange,
} from "../middleware";

const router = Router();

// Public routes
router.post("/register", authLimiter, validateRegistration, register);
router.post("/login", authLimiter, validateLogin, login);
router.post(
  "/verify-email",
  emailVerificationLimiter,
  validateEmailVerification,
  verifyEmail
);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validatePasswordResetRequest,
  forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validatePasswordReset,
  resetPassword
);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Protected routes
router.get("/me", authenticateToken, getProfile);
router.post(
  "/change-password",
  authenticateToken,
  validatePasswordChange,
  changePassword
);

export default router;
