import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Environment variable validation configuration
 */
interface EnvConfig {
  [key: string]: {
    required: boolean;
    type: 'string' | 'number' | 'boolean';
    default?: any;
    description: string;
    validator?: (value: any) => boolean;
  };
}

/**
 * Environment variables configuration
 */
const ENV_CONFIG: EnvConfig = {
  // Server Configuration
  NODE_ENV: {
    required: true,
    type: 'string',
    default: 'development',
    description: 'Application environment (development, production, test)',
    validator: (value) => ['development', 'production', 'test'].includes(value)
  },
  PORT: {
    required: false,
    type: 'number',
    default: 5000,
    description: 'Server port number'
  },

  // Database Configuration
  DATABASE_URL: {
    required: true,
    type: 'string',
    description: 'PostgreSQL database connection string'
  },
  POSTGRES_DB: {
    required: true,
    type: 'string',
    description: 'PostgreSQL database name'
  },
  POSTGRES_USER: {
    required: true,
    type: 'string',
    description: 'PostgreSQL username'
  },
  POSTGRES_PASSWORD: {
    required: true,
    type: 'string',
    description: 'PostgreSQL password'
  },
  POSTGRES_PORT: {
    required: false,
    type: 'number',
    default: 5432,
    description: 'PostgreSQL port number'
  },

  // JWT Configuration
  JWT_SECRET: {
    required: true,
    type: 'string',
    description: 'JWT signing secret key',
    validator: (value) => value.length >= 32
  },
  JWT_REFRESH_SECRET: {
    required: true,
    type: 'string',
    description: 'JWT refresh token secret key',
    validator: (value) => value.length >= 32
  },
  JWT_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '15m',
    description: 'JWT access token expiration time'
  },
  JWT_REFRESH_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '7d',
    description: 'JWT refresh token expiration time'
  },

  // Email Configuration (Resend)
  RESEND_API_KEY: {
    required: true,
    type: 'string',
    description: 'Resend API key for email service'
  },
  RESEND_FROM_EMAIL: {
    required: true,
    type: 'string',
    description: 'Sender email address',
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  RESEND_FROM_NAME: {
    required: true,
    type: 'string',
    description: 'Sender name for emails'
  },

  // Redis Configuration
  REDIS_HOST: {
    required: false,
    type: 'string',
    default: 'localhost',
    description: 'Redis server host'
  },
  REDIS_PORT: {
    required: false,
    type: 'number',
    default: 6379,
    description: 'Redis server port'
  },
  REDIS_PASSWORD: {
    required: true,
    type: 'string',
    description: 'Redis server password'
  },

  // CORS Configuration
  CORS_ORIGIN: {
    required: true,
    type: 'string',
    description: 'Allowed CORS origins'
  },

  // Application URLs
  APP_URL: {
    required: true,
    type: 'string',
    description: 'Frontend application URL'
  },
  FRONTEND_URL: {
    required: false,
    type: 'string',
    description: 'Frontend application URL (alias for APP_URL)'
  },

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    default: 900000,
    description: 'Rate limiting window in milliseconds (15 minutes)'
  },
  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    default: 100,
    description: 'Maximum requests per window'
  }
};

/**
 * Validation error class
 */
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validate and parse environment variable
 */
function validateEnvVar(key: string, config: EnvConfig[string]): any {
  const value = process.env[key];
  
  // Check if required variable is missing
  if (config.required && (value === undefined || value === '')) {
    throw new EnvValidationError(
      `Missing required environment variable: ${key}\n` +
      `Description: ${config.description}`
    );
  }

  // Use default value if not provided
  const finalValue = value || config.default;

  // Type validation
  if (finalValue !== undefined) {
    switch (config.type) {
      case 'number':
        const numValue = Number(finalValue);
        if (isNaN(numValue)) {
          throw new EnvValidationError(
            `Invalid number for environment variable: ${key}\n` +
            `Expected: number, Got: ${finalValue}`
          );
        }
        return numValue;
      
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(finalValue.toLowerCase())) {
          throw new EnvValidationError(
            `Invalid boolean for environment variable: ${key}\n` +
            `Expected: true/false, Got: ${finalValue}`
          );
        }
        return ['true', '1'].includes(finalValue.toLowerCase());
      
      case 'string':
      default:
        // Custom validator
        if (config.validator && !config.validator(finalValue)) {
          throw new EnvValidationError(
            `Invalid value for environment variable: ${key}\n` +
            `Description: ${config.description}\n` +
            `Got: ${finalValue}`
          );
        }
        return finalValue;
    }
  }

  return finalValue;
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const validated: Record<string, any> = {};

  console.log('🔍 Validating environment variables...\n');

  // Validate each environment variable
  for (const [key, config] of Object.entries(ENV_CONFIG)) {
    try {
      const value = validateEnvVar(key, config);
      validated[key] = value;
      
      // Log successful validation (mask sensitive values)
      const displayValue = ['PASSWORD', 'SECRET', 'KEY'].some(sensitive => 
        key.includes(sensitive)
      ) ? '***' : value;
      
      console.log(`✅ ${key}: ${displayValue}`);
    } catch (error) {
      if (error instanceof EnvValidationError) {
        errors.push(error.message);
        console.log(`❌ ${key}: ${error.message.split('\n')[0]}`);
      } else {
        errors.push(`Unexpected error validating ${key}: ${error}`);
        console.log(`❌ ${key}: Unexpected error`);
      }
    }
  }

  // Handle FRONTEND_URL alias
  if (!validated['FRONTEND_URL'] && validated['APP_URL']) {
    validated['FRONTEND_URL'] = validated['APP_URL'];
    console.log(`✅ FRONTEND_URL: ${validated['APP_URL']} (using APP_URL)`);
  }

  console.log(''); // Empty line for readability

  // If there are errors, throw them
  if (errors.length > 0) {
    console.error('❌ Environment validation failed!\n');
    console.error('Missing or invalid environment variables:\n');
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}\n`);
    });
    
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('Refer to .env.example for the required format.\n');
    
    throw new EnvValidationError(
      `Environment validation failed with ${errors.length} error(s)`
    );
  }

  console.log('✅ All environment variables validated successfully!\n');
}

/**
 * Get validated environment variable
 */
export function getEnv(key: keyof typeof ENV_CONFIG): any {
  const config = ENV_CONFIG[key];
  if (!config) {
    throw new Error(`Unknown environment variable: ${String(key)}`);
  }
  return validateEnvVar(String(key), config);
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return String(getEnv('NODE_ENV')) === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return String(getEnv('NODE_ENV')) === 'development';
}

/**
 * Check if environment is test
 */
export function isTest(): boolean {
  return String(getEnv('NODE_ENV')) === 'test';
}
