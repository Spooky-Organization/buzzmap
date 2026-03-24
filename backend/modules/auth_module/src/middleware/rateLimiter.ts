import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis";

const createStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix,
  });

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  store: createStore("rl-general:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy so rate limits use real client IP when behind Cloudflare/Coolify
  validate: {
    trustProxy: true,
  },
});

/**
 * Authentication rate limiter
 * 5 attempts per 15 minutes for login/register
 */
export const authLimiter = rateLimit({
  store: createStore("rl-auth:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy so rate limits use real client IP when behind Cloudflare/Coolify
  validate: {
    trustProxy: true,
  },
});

/**
 * Password reset rate limiter
 * 3 attempts per hour
 */
export const passwordResetLimiter = rateLimit({
  store: createStore("rl-password-reset:"),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: "Too many password reset attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy so rate limits use real client IP when behind Cloudflare/Coolify
  validate: {
    trustProxy: true,
  },
});

/**
 * Email verification rate limiter
 * 10 attempts per hour
 */
export const emailVerificationLimiter = rateLimit({
  store: createStore("rl-email-verify:"),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: "Too many email verification attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy so rate limits use real client IP when behind Cloudflare/Coolify
  validate: {
    trustProxy: true,
  },
});

/**
 * Admin endpoints rate limiter
 * 50 requests per 15 minutes
 */
export const adminLimiter = rateLimit({
  store: createStore("rl-admin:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: "Too many admin requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy so rate limits use real client IP when behind Cloudflare/Coolify
  validate: {
    trustProxy: true,
  },
});
