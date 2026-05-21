const requiredEnvVars = [
  'NODE_ENV',
  'FRONTEND_URL',
  'BACKEND_URL',
  'CORS_ORIGIN',
  'BACKEND_PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'NEXTAUTH_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'STORAGE_ENDPOINT',
  'STORAGE_PORT',
  'STORAGE_ACCESS_KEY',
  'STORAGE_SECRET_KEY',
  'STORAGE_BUCKET_NAME',
  'STORAGE_USE_SSL',
  'SOCKET_CORS_ORIGIN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'BCRYPT_SALT_ROUNDS',
  'MAX_FILE_SIZE',
  'ALLOWED_FILE_TYPES',
  'LOG_LEVEL',
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function validateEnv(): Record<RequiredEnvVar, string> {
  const missing: string[] = [];

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}`
    );
  }

  return Object.fromEntries(
    requiredEnvVars.map((key) => [key, process.env[key] as string])
  ) as Record<RequiredEnvVar, string>;
}

const env = validateEnv();

export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',

  frontendUrl: env.FRONTEND_URL,
  backendUrl: env.BACKEND_URL,
  corsOrigin: env.CORS_ORIGIN,
  backendPort: parseInt(env.BACKEND_PORT, 10),

  databaseUrl: env.DATABASE_URL,

  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD,
  },

  nextAuthSecret: env.NEXTAUTH_SECRET,

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  storage: {
    endpoint: env.STORAGE_ENDPOINT,
    port: parseInt(env.STORAGE_PORT, 10),
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
    bucketName: env.STORAGE_BUCKET_NAME,
    useSsl: env.STORAGE_USE_SSL === 'true',
  },

  socketCorsOrigin: env.SOCKET_CORS_ORIGIN,

  rateLimitWindowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMaxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),

  bcryptSaltRounds: parseInt(env.BCRYPT_SALT_ROUNDS, 10),
  maxFileSize: env.MAX_FILE_SIZE,
  allowedFileTypes: env.ALLOWED_FILE_TYPES.split(',').map((t) => t.trim()),
  logLevel: env.LOG_LEVEL,
} as const;
