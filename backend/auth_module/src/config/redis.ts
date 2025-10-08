import { createClient } from "redis";
import { getEnv } from "../utils/envValidation";

const host = getEnv('REDIS_HOST');
const port = getEnv('REDIS_PORT');
const password = getEnv('REDIS_PASSWORD');

const redisClient = createClient({
  url: `redis://${host}:${port}`,
  ...(password && { password }),
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.on("connect", () =>
  console.log("✅ Redis client connected successfully")
);

/**
 * Connects to the Redis server.
 * The client is disconnected by default and must be connected before use.
 */
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

// It's better to connect when the app starts rather than on module load.
// We'll call this from server.ts
export { redisClient, connectRedis };
