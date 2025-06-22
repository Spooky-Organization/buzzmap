import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Configuration
const SALT_ROUNDS = 12; // Higher number = more secure but slower
const TOKEN_LENGTH = 32; // Length of random tokens

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Failed to hash password");
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Promise<boolean> - True if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Failed to compare passwords");
  }
};

/**
 * Generate JWT token
 * @param payload - Token payload
 * @returns string - JWT token
 */
export const generateToken = (payload: {
  userId: string;
  email: string;
  role: string;
}): string => {
  const jwtSecret = process.env["JWT_SECRET"];
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "15m", // Access token expires in 15 minutes
  });
};

/**
 * Validate password strength (simple version)
 * @param password - Password to validate
 * @returns boolean - True if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Generate a secure random token for email verification and password reset
 * @param length - Length of the token (default: 32)
 * @returns string - Random token
 */
export const generateSecureToken = (length: number = TOKEN_LENGTH): string => {
  try {
    return crypto.randomBytes(length).toString("hex");
  } catch (error) {
    throw new Error("Failed to generate secure token");
  }
};

/**
 * Generate a random string for temporary purposes
 * @param length - Length of the string (default: 16)
 * @returns string - Random string
 */
export const generateRandomString = (length: number = 16): string => {
  try {
    return crypto.randomBytes(length).toString("hex");
  } catch (error) {
    throw new Error("Failed to generate random string");
  }
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns { isValid: boolean; errors: string[] } - Validation result
 */
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate a password reset token with expiration
 * @returns { token: string; expiresAt: Date } - Token and expiration
 */
export const generatePasswordResetToken = (): {
  token: string;
  expiresAt: Date;
} => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  return {
    token,
    expiresAt,
  };
};

/**
 * Generate an email verification token
 * @returns string - Verification token
 */
export const generateEmailVerificationToken = (): string => {
  return generateSecureToken();
};
