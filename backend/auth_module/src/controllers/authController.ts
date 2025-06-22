import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../config/prisma";

// Import utilities
import {
  hashPassword,
  comparePassword,
  generateToken,
  validatePassword,
} from "../utils/passwordUtils";
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "../utils/emailUtils";
import { ApiError, asyncHandler } from "../middleware";
import { logFailedLogin } from "../utils/logger";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
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
      email,
      password: hashedPassword,
      firstName,
      lastName,
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
    console.log("Sending verification email to:", user.email);
    const emailTemplate = getVerificationEmailTemplate({
      to: user.email,
      token: emailVerificationToken,
    });
    await sendEmail(emailTemplate);
    console.log("Verification email sent successfully to:", user.email);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    console.error("Email configuration:", {
      apiKey: process.env["RESEND_API_KEY"] ? "Set" : "Not set",
      fromEmail: process.env["RESEND_FROM_EMAIL"],
      fromName: process.env["RESEND_FROM_NAME"],
    });
    // Don't fail registration if email fails, but log the error
  }

  // Generate JWT tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = crypto.randomBytes(40).toString("hex");

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

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logFailedLogin(req.ip, email);
    throw new ApiError("Invalid email or password", 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    logFailedLogin(req.ip, email);
    throw new ApiError("Invalid email or password", 401);
  }

  // Generate JWT tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

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
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate new refresh token
    const newRefreshToken = crypto.randomBytes(40).toString("hex");

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
