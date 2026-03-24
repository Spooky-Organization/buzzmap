import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { ApiError, asyncHandler } from "../middleware";
import { sendEmail, getVerificationEmailTemplate } from "../utils/emailUtils";
import { publishEvent } from "../utils/eventEmitter";

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;
  const role = req.query["role"] as UserRole;
  const search = req.query["search"] as string;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (role) {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

/**
 * Get user by ID
 * GET /api/users/:userId
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.json({ user });
});

/**
 * Update user profile
 * PUT /api/users/:userId
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError("User not found", 404);
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new ApiError("Email already in use", 409);
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      email,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Publish user update event for SSE notification
  await publishEvent("USER_UPDATED", { userId: updatedUser.id });

  res.json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

/**
 * Update user role (Admin only)
 * PATCH /api/users/:userId/role
 */
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError("Invalid role", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ApiError("User not found", 404);
    }

    // Prevent changing own role
    if (req.user && req.user.id === userId) {
      throw new ApiError("Cannot change your own role", 400);
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Publish role change event for SSE notification
    await publishEvent("ROLE_CHANGED", { 
      userId: updatedUser.id,
      data: { oldRole: existingUser.role, newRole: role }
    });

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  }
);

/**
 * Delete user (Admin only)
 * DELETE /api/users/:userId
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError("User not found", 404);
  }

  // Prevent deleting own account
  if (req.user && req.user.id === userId) {
    throw new ApiError("Cannot delete your own account", 400);
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  res.json({
    message: "User deleted successfully",
  });
});

/**
 * Get user statistics (Admin only)
 * GET /api/users/stats
 */
export const getUserStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const [totalUsers, verifiedUsers, unverifiedUsers, usersByRole] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isEmailVerified: true } }),
        prisma.user.count({ where: { isEmailVerified: false } }),
        prisma.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
      ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      stats: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        byRole: roleStats,
      },
    });
  }
);

/**
 * Resend verification email
 * POST /api/users/:userId/resend-verification
 */
export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new ApiError("User email is already verified", 400);
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Update user with new token
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken },
    });

    // Send verification email
    try {
      const emailTemplate = getVerificationEmailTemplate({
        to: user.email,
        token: emailVerificationToken,
      });
      await sendEmail(emailTemplate);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new ApiError("Failed to send verification email", 500);
    }

    res.json({
      message: "Verification email sent successfully",
    });
  }
);
