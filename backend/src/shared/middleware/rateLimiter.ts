import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { type Redis } from 'ioredis';
import { config } from '../../config/index.js';

type RedisReply = boolean | number | string | (boolean | number | string)[];

export function createRateLimiter(windowMs?: number, max?: number) {
  return rateLimit({
    windowMs: windowMs ?? config.rateLimitWindowMs,
    max: max ?? config.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function createRateLimiterWithRedis(
  redisClient: Redis,
  windowMs?: number,
  max?: number
) {
  return rateLimit({
    windowMs: windowMs ?? config.rateLimitWindowMs,
    max: max ?? config.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]): Promise<RedisReply> =>
        redisClient.call(
          ...(args as Parameters<typeof redisClient.call>)
        ) as Promise<RedisReply>,
    }),
  });
}
