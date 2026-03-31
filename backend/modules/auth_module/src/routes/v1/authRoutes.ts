import { Router } from "express";
import {
  register,
  registerCustomer,
  registerBusiness,
  login,
  completeLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  changePassword,
} from "../../controllers/authController";

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
  methodRestriction,
} from "../../middleware";

import { customerRegistrationValidation } from "../../validators/customerRegistration";
import { businessRegistrationValidation } from "../../validators/businessRegistration";

const router = Router();

// Public routes - Method restricted
router.post(
  "/register",
  methodRestriction({ allowed: ["POST"] }),
  authLimiter,
  validateRegistration,
  register
);

router.post(
  "/register/customer",
  methodRestriction({ allowed: ["POST"] }),
  authLimiter,
  customerRegistrationValidation,
  registerCustomer
);

router.post(
  "/register/business",
  methodRestriction({ allowed: ["POST"] }),
  authLimiter,
  businessRegistrationValidation,
  registerBusiness
);

router.post(
  "/login",
  methodRestriction({ allowed: ["POST"] }),
  authLimiter,
  validateLogin,
  login
);

router.post(
  "/login/complete",
  methodRestriction({ allowed: ["POST"] }),
  authLimiter,
  completeLogin
);

router.post(
  "/verify-email",
  methodRestriction({ allowed: ["POST"] }),
  emailVerificationLimiter,
  validateEmailVerification,
  verifyEmail
);

router.post(
  "/forgot-password",
  methodRestriction({ allowed: ["POST"] }),
  passwordResetLimiter,
  validatePasswordResetRequest,
  forgotPassword
);

router.post(
  "/reset-password",
  methodRestriction({ allowed: ["POST"] }),
  passwordResetLimiter,
  validatePasswordReset,
  resetPassword
);

router.post(
  "/refresh",
  methodRestriction({ allowed: ["POST"] }),
  refreshToken
);

router.post(
  "/logout",
  methodRestriction({ allowed: ["POST"] }),
  logout
);

// Protected routes - Method restricted
router.get(
  "/me",
  methodRestriction({ allowed: ["GET"] }),
  authenticateToken,
  getProfile
);

router.post(
  "/change-password",
  methodRestriction({ allowed: ["POST"] }),
  authenticateToken,
  validatePasswordChange,
  changePassword
);

export default router;
