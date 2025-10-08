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
} from "../../middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.get("/", requireAdmin, adminLimiter, validatePagination, getAllUsers);
router.get("/stats", requireAdmin, adminLimiter, getUserStats);
router.patch("/:userId/role", requireAdmin, adminLimiter, validateUserId, validateRoleAssignment, updateUserRole);
router.delete("/:userId", requireAdmin, adminLimiter, validateUserId, deleteUser);
router.post("/:userId/resend-verification", requireAdmin, adminLimiter, validateUserId, resendVerificationEmail);

// User management routes (Admin or own user)
router.get("/:userId", requireAdminOrAccountant, validateUserId, getUserById);
router.put("/:userId", requireOwnershipOrAdmin, validateUserId, validateUserUpdate, updateUser);

export default router; 