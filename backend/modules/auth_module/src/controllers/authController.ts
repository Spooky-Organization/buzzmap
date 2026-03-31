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
import { 
  logSecurityEvent, 
  logFailedLogin as securityLogFailedLogin,
  logLoginSuccess,
  logAccountLockout,
  logAccountBan,
  getClientInfo,
  SecurityEventType
} from "../utils/securityLogger";
import { 
  addUserSession, 
  removeUserSession, 
  getUserSessions,
  getUserSessionCount,
  invalidateSession 
} from "../utils/cache";
import { publishEvent, syncUserSession } from "../utils/eventEmitter";
import { CustomerFactory } from "../factories/CustomerFactory";
import { BusinessOwnerFactory } from "../factories/BusinessOwnerFactory";
import { sanitizeEmail, sanitizeName } from "../middleware";

// Account security constants (OWASP A02)
const MAX_LOGIN_ATTEMPTS = 4;
const MAX_LOGIN_ATTEMPTS_BEFORE_BAN = 6;
const LOCKOUT_DURATION_MINUTES = 30;
const MAX_CONCURRENT_SESSIONS = 4;

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

  // Publish welcome notification
  await publishEvent("USER_REGISTERED", { userId: user.id });

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
 * Register a new customer
 * POST /api/auth/register/customer
 */
export const registerCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password, firstName, lastName, interests } = req.body;
  
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedFirstName = firstName ? sanitizeName(firstName) : undefined;
  const sanitizedLastName = lastName ? sanitizeName(lastName) : undefined;

  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  const result = await CustomerFactory.create({
    email: sanitizedEmail,
    phone,
    password,
    firstName: sanitizedFirstName || '',
    lastName: sanitizedLastName || '',
    interests,
  });

  await publishEvent("USER_REGISTERED", { userId: result.id });

  res.status(201).json({
    message: "Customer registered successfully",
    user: {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      interests: result.interests,
    },
    tokens: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * Register a new business owner
 * POST /api/auth/register/business
 */
export const registerBusiness = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password, firstName, lastName, businessName, businessCategory, businessType } = req.body;
  
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedFirstName = firstName ? sanitizeName(firstName) : undefined;
  const sanitizedLastName = lastName ? sanitizeName(lastName) : undefined;

  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  const result = await BusinessOwnerFactory.create({
    email: sanitizedEmail,
    phone,
    password,
    firstName: sanitizedFirstName || '',
    lastName: sanitizedLastName || '',
    businessName,
    businessCategory,
    businessType,
  });

  await publishEvent("BUSINESS_OWNER_REGISTERED", { userId: result.id, businessId: result.business.id });

  res.status(201).json({
    message: "Business owner registered successfully",
    user: {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
    },
    business: result.business,
    tokens: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 * 
 * Implements OWASP A02:2021 - Cryptographic Failures
 * - Account lockout after 4 failed attempts
 * - Permanent ban after 6 failed attempts
 * - Session limit enforcement (max 4 concurrent sessions)
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { ip, userAgent } = getClientInfo(req);
  
  // Sanitize email input
  const sanitizedEmail = sanitizeEmail(email);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!user) {
    // Log failed attempt for non-existent user (security monitoring)
    securityLogFailedLogin(ip, sanitizedEmail, "User not found");
    throw new ApiError("Invalid email or password", 401);
  }

  // Check if account is banned (OWASP A02)
  if (user.isBanned) {
    logSecurityEvent({
      eventType: SecurityEventType.LOGIN_BANNED,
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      message: "Banned account attempted login",
    });
    throw new ApiError("Account has been permanently banned", 403);
  }

  // Check if account is locked (OWASP A02)
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000
    );
    logSecurityEvent({
      eventType: SecurityEventType.LOGIN_LOCKED,
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      message: "Locked account attempted login",
      metadata: { remainingMinutes },
    });
    throw new ApiError(
      `Account is locked. Please try again in ${remainingMinutes} minute(s).`,
      423
    );
  }

  // Clear lockout if it has expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedUntil: null, failedAttempts: 0 },
    });
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    // Increment failed attempts
    const newFailedAttempts = user.failedAttempts + 1;
    
    // Determine lockout or ban
    let lockoutUpdate: { lockedUntil: Date | null; isBanned?: boolean } = { lockedUntil: null };
    let lockoutMessage = "";
    
    if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS_BEFORE_BAN) {
      // Permanent ban after too many attempts
      lockoutUpdate = { lockedUntil: null, isBanned: true };
      lockoutMessage = "Account permanently banned due to repeated failed login attempts";
      logAccountBan(user.email, ip, `Failed attempts: ${newFailedAttempts}`);
    } else if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Temporary lockout
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      lockoutUpdate = { lockedUntil: lockUntil };
      lockoutMessage = `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes`;
      logAccountLockout(user.email, ip, `Failed attempts: ${newFailedAttempts}`);
    }

    // Update user with failed attempts and potential lockout
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        ...lockoutUpdate,
      },
    });

    securityLogFailedLogin(ip, sanitizedEmail, `Failed attempt ${newFailedAttempts}/${MAX_LOGIN_ATTEMPTS_BEFORE_BAN}`);
    throw new ApiError(lockoutMessage || "Invalid email or password", 401);
  }

  // Reset failed attempts on successful password verification
  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  // Check concurrent session limit (OWASP A07)
  const currentSessionCount = await getUserSessionCount(user.id);
  if (currentSessionCount >= MAX_CONCURRENT_SESSIONS) {
    // Remove oldest session to make room
    const sessions = await getUserSessions(user.id);
    const oldestSession = sessions[0];
    if (oldestSession) {
      await removeUserSession(user.id, oldestSession.sessionId);
      logSecurityEvent({
        eventType: SecurityEventType.SESSION_LIMIT_EXCEEDED,
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        message: "Removed oldest session due to session limit",
        metadata: { removedSession: oldestSession.sessionId },
      });
    }
  }

  // Check if MFA is enabled
  if (user.mfaEnabled) {
    // Return response indicating MFA verification is required
    res.json({
      message: "MFA verification required",
      mfaRequired: true,
      email: user.email,
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

  // Add session to Redis for multi-device tracking
  const sessionId = crypto.randomBytes(32).toString("hex");
  await addUserSession(user.id, sessionId, {
    ip,
    userAgent,
    createdAt: new Date().toISOString(),
  });

  // Log successful login
  logLoginSuccess(user.id, user.email, ip, userAgent);

  // Publish session sync event for multi-device notification
  await syncUserSession(user.id, "login");

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
    session: {
      id: sessionId,
      activeSessions: currentSessionCount + 1,
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

  // Publish email verified event
  await publishEvent("EMAIL_VERIFIED", { userId: user.id });

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

  // If user is authenticated, also invalidate their session
  if (req.user) {
    const { ip, userAgent } = getClientInfo(req);
    await invalidateSession(req.user.id);
    logSecurityEvent({
      eventType: SecurityEventType.LOGOUT,
      userId: req.user.id,
      email: req.user.email,
      ip,
      userAgent,
      message: "User logged out",
    });
    // Publish session sync event for multi-device notification
    await syncUserSession(req.user.id, "logout");
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

    // Publish session sync event for multi-device notification
    await syncUserSession(user.id, "login");

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
