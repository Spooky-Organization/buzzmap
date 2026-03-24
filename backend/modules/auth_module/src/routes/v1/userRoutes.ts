import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserStats,
  resendVerificationEmail,
} from "../../controllers/userController";

import {
  authenticateToken,
  requireAdmin,
  requireAdminOrAccountant,
  requireOwnershipOrAdmin,
  adminLimiter,
  validateUserUpdate,
  validateRoleAssignment,
  validateUserId,
  validatePagination,
  methodRestriction,
  HttpMethod,
} from "../../middleware";

const router = Router();

const getOnly = methodRestriction({ allowed: ["GET"] as HttpMethod[] });
const postOnly = methodRestriction({ allowed: ["POST"] as HttpMethod[] });
const putOnly = methodRestriction({ allowed: ["PUT"] as HttpMethod[] });
const patchOnly = methodRestriction({ allowed: ["PATCH"] as HttpMethod[] });
const deleteOnly = methodRestriction({ allowed: ["DELETE"] as HttpMethod[] });

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes - Method restricted
router.get(
  "/",
  getOnly,
  requireAdmin,
  adminLimiter,
  validatePagination,
  getAllUsers
);

router.get(
  "/stats",
  getOnly,
  requireAdmin,
  adminLimiter,
  getUserStats
);

router.patch(
  "/:userId/role",
  patchOnly,
  requireAdmin,
  adminLimiter,
  validateUserId,
  validateRoleAssignment,
  updateUserRole
);

router.delete(
  "/:userId",
  deleteOnly,
  requireAdmin,
  adminLimiter,
  validateUserId,
  deleteUser
);

router.post(
  "/:userId/resend-verification",
  postOnly,
  requireAdmin,
  adminLimiter,
  validateUserId,
  resendVerificationEmail
);

// User management routes - Method restricted (Admin or own user)
router.get(
  "/:userId",
  getOnly,
  requireAdminOrAccountant,
  validateUserId,
  getUserById
);

router.put(
  "/:userId",
  putOnly,
  requireOwnershipOrAdmin,
  validateUserId,
  validateUserUpdate,
  updateUser
);

export default router;
