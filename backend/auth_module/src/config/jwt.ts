import jwt from "jsonwebtoken";
import { JWTPayload, UserRole } from "../types";
import { getEnv } from "../utils/envValidation";

// JWT Configuration (validated at startup)
const JWT_SECRET = getEnv('JWT_SECRET');
const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN');
const JWT_REFRESH_EXPIRES_IN = getEnv('JWT_REFRESH_EXPIRES_IN');

/**
 * Generate JWT access token
 */
export const generateAccessToken = (
  userId: string,
  email: string,
  role: UserRole
): string => {
  const payload: JWTPayload = {
    userId,
    email,
    role,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "auth-template",
    audience: "auth-template-users",
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (
  userId: string,
  email: string,
  role: UserRole
): string => {
  const payload: JWTPayload = {
    userId,
    email,
    role,
    type: "refresh",
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "auth-template",
    audience: "auth-template-users",
  } as jwt.SignOptions);
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "auth-template",
      audience: "auth-template-users",
    }) as JWTPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "auth-template",
      audience: "auth-template-users",
    }) as JWTPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (
  userId: string,
  email: string,
  role: UserRole
) => {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId, email, role);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Decode JWT token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
