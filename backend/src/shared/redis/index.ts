import Redis from 'ioredis';
import { config } from '../../config/index.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis client not initialized. Call initRedis() first.');
  return redis;
}

export function initRedis(): Redis {
  if (redis) return redis;
  redis = new Redis(config.redis.url);
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
