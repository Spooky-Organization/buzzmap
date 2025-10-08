import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../config/prisma";

// Import utilities
import {
  hashPassword,
  comparePassword,
  validatePassword,
} from "../utils/passwordUtils";
import { generateAccessToken, generateRefreshToken } from "../config/jwt";
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "../utils/emailUtils";
import { ApiError, asyncHandler, sanitizeEmail, sanitizeName } from "../middleware";
import { logFailedLogin } from "../utils/logger";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedFirstName = firstName ? sanitizeName(firstName) : undefined;
  const sanitizedLastName = lastName ? sanitizeName(lastName) : undefined;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const user = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      password: hashedPassword,
      firstName: sanitizedFirstName || null,
      lastName: sanitizedLastName || null,
      role: UserRole.USER, // Default role
      emailVerificationToken,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
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
    // Don't fail registration if email fails, but log the error
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(201).json({
    message:
      "User registered successfully. Please check your email to verify your account.",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Sanitize email input
  const sanitizedEmail = sanitizeEmail(email);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!user) {
    logFailedLogin(req.ip, sanitizedEmail);
    throw new ApiError("Invalid email or password", 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    logFailedLogin(req.ip, sanitizedEmail);
    throw new ApiError("Invalid email or password", 401);
  }

  // Check if MFA is enabled
  if (user.mfaEnabled) {
    // Return response indicating MFA verification is required
    res.json({
      message: "MFA verification required",
      mfaRequired: true,
      email: user.email,
      // Don't return tokens yet - they'll be provided after MFA verification
    });
    return;
  }

  // Generate JWT tokens (only if MFA is not enabled)
  const accessToken = generateAccessToken(user.id, user.email, user.role);

  const refreshToken = crypto.randomBytes(40).toString("hex");

  // Update refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Verify email
 * POST /api/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  // Find user with this verification token
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new ApiError("Invalid or expired verification token", 400);
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
    },
  });

  res.json({
    message: "Email verified successfully",
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    try {
      const emailTemplate = getPasswordResetEmailTemplate({
        to: user.email,
        token: resetToken,
      });
      await sendEmail(emailTemplate);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new ApiError("Failed to send password reset email", 500);
    }

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }
);

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ApiError("Invalid or expired reset token", 400);
    }

    // Validate new password
    if (!validatePassword(password)) {
      throw new ApiError("Password does not meet requirements", 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      message: "Password reset successfully",
    });
  }
);

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError("Refresh token is required", 400);
    }

    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new ApiError("Invalid refresh token", 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email, user.role);

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  }
);

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Invalidate refresh token
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
  }

  res.json({
    message: "Logged out successfully",
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Authentication required", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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

  res.json({
    user,
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new ApiError("Current password is incorrect", 400);
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new ApiError("New password does not meet requirements", 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Password changed successfully",
    });
  }
);

/**
 * Complete login after MFA verification
 * POST /api/auth/login/complete
 */
export const completeLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError("Email is required", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.mfaEnabled) {
      throw new ApiError("MFA is not enabled for this user", 400);
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      message: "Login completed successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }
);
