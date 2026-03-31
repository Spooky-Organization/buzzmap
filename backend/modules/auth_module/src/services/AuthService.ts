import crypto from "crypto";
import { User } from "@prisma/client";
import { ApiError } from "../middleware";
import { comparePassword } from "../utils/passwordUtils";
import { generateAccessToken, generateRefreshToken } from "../config/jwt";
import {
  addUserSession,
  removeUserSession,
  getUserSessions,
  getUserSessionCount,
} from "../utils/cache";
import { syncUserSession, publishEvent } from "../utils/eventEmitter";
import userRepository from "../repositories/UserRepository";

export const MAX_LOGIN_ATTEMPTS = 4;
export const MAX_LOGIN_ATTEMPTS_BEFORE_BAN = 6;
export const LOCKOUT_DURATION_MINUTES = 30;
export const MAX_CONCURRENT_SESSIONS = 4;

export interface ValidationResult {
  user: User;
  requiresMfa: boolean;
}

export interface SessionResult {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  activeSessions: number;
}

class AuthService {
  async validateCredentials(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string
  ): Promise<ValidationResult> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    if (user.isBanned) {
      throw new ApiError("Account has been permanently banned", 403);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      throw new ApiError(
        `Account is locked. Please try again in ${remainingMinutes} minute(s).`,
        423
      );
    }

    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await userRepository.resetFailedAttempts(user.id);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const newFailedAttempts = await userRepository.incrementFailedAttempts(
        user.id
      );

      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS_BEFORE_BAN) {
        await userRepository.banAccount(user.id);
        throw new ApiError(
          "Account permanently banned due to repeated failed login attempts",
          403
        );
      } else if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
        await userRepository.lockAccount(user.id, lockUntil);
        throw new ApiError(
          `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes`,
          423
        );
      }

      throw new ApiError("Invalid email or password", 401);
    }

    await userRepository.resetFailedAttempts(user.id);

    return {
      user,
      requiresMfa: user.mfaEnabled,
    };
  }

  async createSession(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<SessionResult> {
    const currentSessionCount = await getUserSessionCount(userId);

    if (currentSessionCount >= MAX_CONCURRENT_SESSIONS) {
      const sessions = await getUserSessions(userId);
      const oldestSession = sessions[0];
      if (oldestSession) {
        await removeUserSession(userId, oldestSession.sessionId);
      }
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const sessionId = crypto.randomBytes(32).toString("hex");

    await userRepository.updateRefreshToken(user.id, refreshToken);
    await userRepository.updateLastLogin(user.id);

    await addUserSession(user.id, sessionId, {
      ip,
      userAgent,
      createdAt: new Date().toISOString(),
    });

    await syncUserSession(user.id, "login");

    return {
      accessToken,
      refreshToken,
      sessionId,
      activeSessions: currentSessionCount + 1,
    };
  }
}

export const authService = new AuthService();
export default authService;