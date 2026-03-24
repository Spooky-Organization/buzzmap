/**
 * Redis Caching Utilities
 * Provides caching functions for user profiles, sessions, and query results
 */

import { redisClient } from "../config/redis";

const DEFAULT_USER_CACHE_TTL = 300; // 5 minutes
const DEFAULT_SESSION_CACHE_TTL = 604800; // 7 days
const DEFAULT_QUERY_CACHE_TTL = 60; // 1 minute

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * User Profile Cache
 */
export const cacheUser = async (
  userId: string,
  userData: Record<string, unknown>,
  ttl: number = DEFAULT_USER_CACHE_TTL
): Promise<void> => {
  const key = `cache:user:${userId}`;
  const entry: CacheEntry<Record<string, unknown>> = {
    data: userData,
    expiresAt: Date.now() + ttl * 1000,
  };
  await redisClient.set(key, JSON.stringify(entry), { EX: ttl });
};

export const getCachedUser = async (
  userId: string
): Promise<Record<string, unknown> | null> => {
  const key = `cache:user:${userId}`;
  const cached = await redisClient.get(key);
  if (!cached) return null;
  
  const entry: CacheEntry<Record<string, unknown>> = JSON.parse(cached);
  if (Date.now() > entry.expiresAt) {
    await redisClient.del(key);
    return null;
  }
  return entry.data;
};

export const invalidateUserCache = async (userId: string): Promise<void> => {
  const key = `cache:user:${userId}`;
  await redisClient.del(key);
};

/**
 * Session Cache
 */
export const cacheSession = async (
  userId: string,
  sessionData: Record<string, unknown>,
  ttl: number = DEFAULT_SESSION_CACHE_TTL
): Promise<void> => {
  const key = `cache:session:${userId}`;
  await redisClient.set(key, JSON.stringify(sessionData), { EX: ttl });
};

export const getCachedSession = async (
  userId: string
): Promise<Record<string, unknown> | null> => {
  const key = `cache:session:${userId}`;
  const cached = await redisClient.get(key);
  if (!cached) return null;
  return JSON.parse(cached);
};

export const invalidateSession = async (userId: string): Promise<void> => {
  const key = `cache:session:${userId}`;
  await redisClient.del(key);
};

/**
 * User Sessions Management (for multi-device support)
 */
export const addUserSession = async (
  userId: string,
  sessionId: string,
  metadata: Record<string, unknown>
): Promise<number> => {
  const sessionsKey = `sessions:${userId}`;
  const sessionKey = `session:${sessionId}`;
  
  await redisClient.hSet(sessionsKey, sessionId, JSON.stringify(metadata));
  await redisClient.set(sessionKey, JSON.stringify({ userId, ...metadata }), { EX: DEFAULT_SESSION_CACHE_TTL });
  
  const sessionCount = await redisClient.hLen(sessionsKey);
  return sessionCount;
};

export const removeUserSession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  const sessionsKey = `sessions:${userId}`;
  const sessionKey = `session:${sessionId}`;
  
  await redisClient.hDel(sessionsKey, sessionId);
  await redisClient.del(sessionKey);
};

export const getUserSessions = async (
  userId: string
): Promise<Array<{ sessionId: string; metadata: Record<string, unknown> }>> => {
  const sessionsKey = `sessions:${userId}`;
  const sessions = await redisClient.hGetAll(sessionsKey);
  
  return Object.entries(sessions).map(([sessionId, metadata]) => ({
    sessionId,
    metadata: JSON.parse(metadata),
  }));
};

export const removeAllUserSessions = async (userId: string): Promise<void> => {
  const sessionsKey = `sessions:${userId}`;
  const sessionIds = await redisClient.hKeys(sessionsKey);
  
  const pipeline = redisClient.multi();
  pipeline.del(sessionsKey);
  sessionIds.forEach((sessionId) => {
    pipeline.del(`session:${sessionId}`);
  });
  await pipeline.exec();
};

export const getUserSessionCount = async (userId: string): Promise<number> => {
  const sessionsKey = `sessions:${userId}`;
  return await redisClient.hLen(sessionsKey);
};

/**
 * Query Result Cache
 */
export const cacheQuery = async (
  key: string,
  data: unknown,
  ttl: number = DEFAULT_QUERY_CACHE_TTL
): Promise<void> => {
  const cacheKey = `cache:query:${key}`;
  await redisClient.set(cacheKey, JSON.stringify(data), { EX: ttl });
};

export const getCachedQuery = async (key: string): Promise<unknown | null> => {
  const cacheKey = `cache:query:${key}`;
  const cached = await redisClient.get(cacheKey);
  if (!cached) return null;
  return JSON.parse(cached);
};

export const invalidateQueryCache = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(`cache:query:${pattern}`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const invalidateAllQueryCache = async (): Promise<void> => {
  const keys = await redisClient.keys("cache:query:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

/**
 * User Stats Cache (for admin dashboard)
 */
export const cacheUserStats = async (
  stats: Record<string, unknown>,
  ttl: number = 300
): Promise<void> => {
  const key = "cache:stats:users";
  await redisClient.set(key, JSON.stringify(stats), { EX: ttl });
};

export const getCachedUserStats = async (): Promise<Record<string, unknown> | null> => {
  const key = "cache:stats:users";
  const cached = await redisClient.get(key);
  if (!cached) return null;
  return JSON.parse(cached);
};

export const invalidateUserStats = async (): Promise<void> => {
  const key = "cache:stats:users";
  await redisClient.del(key);
};
