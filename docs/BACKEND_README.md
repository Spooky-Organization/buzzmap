# Backend Service

A robust Node.js and Express authentication system with role-based access control, multi-factor authentication, and comprehensive security features.

## 📁 Folder Structure

```
backend/
├── core/                          # Core application files
│   ├── app.ts                    # Express app configuration and middleware setup
│   └── server.ts                 # Server entry point and startup logic
│
├── modules/                       # Feature modules directory
│   └── auth_module/              # Authentication module (isolated)
│       └── src/
│           ├── config/           # Configuration files
│           │   ├── jwt.ts       # JWT token configuration
│           │   ├── prisma.ts    # Prisma client configuration
│           │   └── redis.ts     # Redis client configuration
│           │
│           ├── controllers/      # Request handlers
│           │   ├── authController.ts    # Authentication endpoints
│           │   ├── mfaController.ts     # Multi-factor authentication
│           │   ├── sseController.ts     # Server-Sent Events endpoints
│           │   └── userController.ts    # User management
│           │
│           ├── middleware/       # Express middleware
│           │   ├── auth.ts          # Authentication middleware
│           │   ├── authorization.ts # Role-based authorization
│           │   ├── errorHandler.ts  # Global error handler
│           │   ├── rateLimiter.ts   # Rate limiting
│           │   ├── sanitization.ts  # Input sanitization
│           │   ├── validation.ts    # Request validation
│           │   ├── methodRestriction.ts # HTTP method enforcement
│           │   └── index.ts         # Middleware exports
│           │
│           ├── routes/          # API route definitions
│           │   ├── index.ts     # Route aggregator
│           │   ├── v1/          # API version 1 routes
│           │   │   ├── authRoutes.ts
│           │   │   ├── mfaRoutes.ts
│           │   │   ├── performanceRoutes.ts
│           │   │   ├── sseRoutes.ts
│           │   │   └── userRoutes.ts
│           │   └── v2/          # API version 2 routes (future)
│           │
│           ├── types/           # TypeScript type definitions
│           │   └── index.ts
│           │
│           └── utils/           # Utility functions
│               ├── emailUtils.ts        # Email service utilities
│               ├── envValidation.ts     # Environment variable validation
│               ├── logger.ts            # Logging utilities
│               ├── mfaUtils.ts          # MFA helper functions
│               ├── passwordUtils.ts      # Password hashing/validation
│               ├── performanceMonitor.ts # Performance monitoring
│               ├── roleUtils.ts          # Role management utilities
│               ├── cache.ts              # Redis caching utilities
│               ├── sseManager.ts         # SSE connection management
│               ├── eventEmitter.ts       # Event publishing for SSE
│               └── securityLogger.ts     # Security event logging
│
├── prisma/                       # Database schema and migrations
│   ├── migrations/              # Database migration files
│   │   ├── 20250622203947_init/
│   │   └── 20250623001456_add_mfa_fields/
│   ├── schema.prisma            # Prisma schema definition
│   └── migration_lock.toml     # Migration lock file
│
├── scripts/                      # Utility scripts
│   ├── docker-entrypoint-dev.sh # Docker development entrypoint
│   └── generate-secrets.js     # Secret generation utility
│
├── volumes/                     # Docker volume mounts
│   ├── logs/                    # Application logs
│   ├── postgres/                # PostgreSQL data
│   └── redis/                   # Redis data
│
├── Dockerfile.dev              # Development Dockerfile
├── Dockerfile.prod             # Production Dockerfile
│
├── package.json                # Node.js dependencies and scripts
├── package-lock.json           # Dependency lock file
├── tsconfig.json                # TypeScript configuration
├── nodemon.json                 # Nodemon configuration
│
├── API_DOCUMENTATION.md         # API endpoint documentation
└── SECURITY_FIXES.md            # Security fixes and improvements
```

## 🏗️ Architecture Overview

### Core Module (`core/`)
- **`app.ts`**: Configures the Express application with middleware, routes, and error handlers
- **`server.ts`**: Entry point that initializes connections (Redis, database) and starts the server

### Auth Module (`modules/auth_module/src/`)
A self-contained authentication module that handles:
- User authentication and authorization
- Multi-factor authentication (MFA)
- JWT token management
- Role-based access control (RBAC)
- Password management
- Email notifications

### Key Features
- 🔐 **Authentication**: JWT-based authentication with refresh tokens
- 🛡️ **Security**: Rate limiting, input sanitization, CORS, Helmet, account lockout
- 🔑 **MFA**: TOTP-based multi-factor authentication
- 👥 **RBAC**: Role-based access control system
- 📧 **Email**: Email notifications via Resend
- 📊 **Monitoring**: Performance monitoring and logging
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- ⚡ **Caching**: Redis for session management and rate limiting
- 🔄 **Real-time**: Server-Sent Events for notifications and session sync
- 🚦 **Method Restriction**: HTTP method enforcement on all routes

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

### Development

**Local development:**
```bash
npm run dev
```

**Docker development:**
```bash
docker-compose -f ../docker-compose.dev.yml up
```

### Production

**Build:**
```bash
npm run build
```

**Start:**
```bash
npm start
```

**Docker production:**
```bash
docker-compose -f ../docker-compose.prod.yml up -d
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building
- `npm test` - Run tests

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `RESEND_API_KEY` - Resend API key for emails
- `CORS_ORIGIN` - Allowed CORS origins

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API endpoint reference
- [SSE Implementation](./SSE_IMPLEMENTATION.md) - Real-time features documentation
- [API Routing](./API_ROUTING.md) - Centralized API routing architecture
- [Security Fixes](./SECURITY_FIXES.md) - Security-related fixes and improvements

## 🏛️ Project Structure Philosophy

This backend follows a modular architecture:

- **`core/`**: Contains the application entry points and Express app configuration. This is the orchestrator that ties everything together.
- **`auth_module/`**: A self-contained authentication module that can be easily maintained, tested, and potentially extracted or reused.
- **`prisma/`**: Database schema and migrations managed separately from business logic.
- **`scripts/`**: Utility scripts for development and deployment.

This separation allows for:
- Clear boundaries between core application logic and feature modules
- Easier testing and maintenance
- Potential for module extraction or reuse
- Better code organization and scalability

## 📋 Development Guidelines

### For Developers and LLMs

**IMPORTANT**: When working on this codebase, you MUST follow the established directory structure and module organization patterns. This ensures consistency, maintainability, and scalability.

### Directory Structure Rules

1. **Core Application Files**
   - All application entry points (`app.ts`, `server.ts`) MUST be in the `core/` directory
   - The `core/` directory should ONLY contain files that orchestrate the application
   - Do NOT place business logic in `core/`

2. **Module Organization**
   - Each feature/domain MUST be organized as a separate module folder
   - Module folders MUST follow the naming convention: `{feature}_module/`
   - Example: `auth_module/`, `payment_module/`, `notification_module/`

3. **Module Structure Requirements**
   - Each module folder MUST contain a `src/` subdirectory
   - ALL module source code MUST be inside the module's `src/` directory
   - Module folders should be self-contained and isolated

### Creating a New Module

When implementing a new feature or domain, follow these steps:

#### Step 1: Create Module Folder Structure

```bash
backend/
└── {feature}_module/          # e.g., payment_module, notification_module
    └── src/
        ├── config/            # Module-specific configuration
        ├── controllers/       # Request handlers
        ├── middleware/        # Module-specific middleware
        ├── routes/           # API route definitions
        ├── services/         # Business logic (if needed)
        ├── types/            # TypeScript type definitions
        └── utils/            # Module-specific utilities
```

#### Step 2: Module Naming Convention

- Use lowercase with underscores: `{feature}_module`
- Be descriptive and specific: `payment_module`, not `pay_module`
- Use singular form for the feature name: `user_module`, not `users_module`

#### Step 3: Module File Organization

Each module's `src/` directory should follow this structure:

```
{feature}_module/
└── src/
    ├── config/               # Configuration files (if module-specific)
    │   └── index.ts
    ├── controllers/          # Request handlers
    │   ├── {feature}Controller.ts
    │   └── index.ts          # Export all controllers
    ├── middleware/           # Module-specific middleware
    │   ├── {feature}Middleware.ts
    │   └── index.ts
    ├── routes/              # API routes
    │   ├── index.ts         # Route aggregator
    │   └── v1/              # Versioned routes
    │       └── {feature}Routes.ts
    ├── services/            # Business logic layer (optional)
    │   ├── {feature}Service.ts
    │   └── index.ts
    ├── types/               # TypeScript types
    │   ├── {feature}.types.ts
    │   └── index.ts
    └── utils/               # Utility functions
        ├── {feature}Utils.ts
        └── index.ts
```

#### Step 4: Module Integration

1. **Create routes in the module:**
   ```typescript
   // {feature}_module/src/routes/v1/{feature}Routes.ts
   import { Router } from 'express';
   import { {Feature}Controller } from '../../controllers';

   const router = Router();
   // Define routes...
   export default router;
   ```

2. **Export from module index:**
   ```typescript
   // {feature}_module/src/routes/index.ts
   export { default as {Feature}RoutesV1 } from './v1/{feature}Routes';
   ```

3. **Import and register in core app:**
   ```typescript
   // core/app.ts
   import { {Feature}RoutesV1 } from '../modules/{feature}_module/src/routes';
   
   // Register routes
   app.use('/api/v1/{feature}', {Feature}RoutesV1);
   ```

### Module Development Best Practices

1. **Isolation**
   - Each module should be self-contained
   - Avoid direct dependencies between modules
   - Use shared utilities in `core/` or create a `shared/` directory for common code

2. **Exports**
   - Always use `index.ts` files for clean exports
   - Export only what's needed by other parts of the application
   - Use named exports for better tree-shaking

3. **Types**
   - Keep module-specific types in the module's `types/` directory
   - Export types that need to be used outside the module
   - Use shared types in a `shared/types/` directory if needed

4. **Testing**
   - Place module tests in `{feature}_module/src/**/*.test.ts`
   - Keep tests close to the code they test
   - Use the module structure for test organization

5. **Documentation**
   - Create a `README.md` in the module folder for complex modules
   - Document module-specific configuration and usage
   - Include examples of how to use the module

### What NOT to Do

❌ **DON'T** place source code directly in `backend/src/`
❌ **DON'T** create modules without the `_module` suffix
❌ **DON'T** mix multiple features in a single module
❌ **DON'T** place business logic in the `core/` directory
❌ **DON'T** create nested modules (e.g., `auth_module/user_module/`)
❌ **DON'T** place module files outside the module's `src/` directory

### Example: Creating a Payment Module

```bash
# 1. Create the module structure inside modules/
backend/
└── modules/
    └── payment_module/
        └── src/
            ├── config/
            │   └── payment.config.ts
            ├── controllers/
            │   ├── paymentController.ts
            │   └── index.ts
            ├── routes/
            │   ├── index.ts
            │   └── v1/
            │       └── paymentRoutes.ts
            ├── services/
            │   ├── paymentService.ts
            │   └── index.ts
            ├── types/
            │   ├── payment.types.ts
            │   └── index.ts
            └── utils/
                ├── paymentUtils.ts
                └── index.ts
```

```typescript
// 2. Export routes from payment_module/src/routes/index.ts
export { default as paymentRoutesV1 } from './v1/paymentRoutes';

// 3. Import and use in core/app.ts
import { paymentRoutesV1 } from '../modules/payment_module/src/routes';
app.use('/api/v1/payments', paymentRoutesV1);
```

### Module Dependencies

- Modules can import from `core/` for application-level utilities
- Modules should NOT directly import from other modules
- Use dependency injection or event-driven patterns for inter-module communication
- Shared code should be in a `shared/` directory at the backend root level

### Updating Existing Modules

When updating an existing module:
- Keep all changes within the module's `src/` directory
- Maintain the established folder structure
- Update module exports if adding new functionality
- Update documentation if the module's API changes

## 🔒 Security Features

- JWT token-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting (Redis-backed)
- Input sanitization and validation
- CORS protection
- Security headers (Helmet)
- Multi-factor authentication (TOTP)
- Account lockout (lock after 4, ban after 6 failed attempts)
- HTTP method restriction on all routes
- Security event logging
- Response compression

## 📦 Dependencies

### Core Dependencies
- **express** - Web framework
- **@prisma/client** - Database ORM
- **jsonwebtoken** - JWT handling
- **bcryptjs** - Password hashing
- **redis** - Caching and rate limiting
- **resend** - Email service
- **speakeasy** - TOTP for MFA

### Development Dependencies
- **typescript** - Type safety
- **ts-node-dev** - Development server
- **prisma** - Database toolkit
- **eslint** - Code linting

## 🐳 Docker

The project includes two optimized Dockerfiles:
- **Dockerfile.dev** - Optimized for development with hot reload and fast iteration
- **Dockerfile.prod** - Multi-stage optimized production build with minimal image size

See the root `docker-compose.dev.yml` and `docker-compose.prod.yml` for container orchestration.

## 📄 License

ISC

---

**© <span id="copyright-year"></span> Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

*All rights reserved.*

