# Authentication Template Backend

A comprehensive, production-ready authentication system built with Node.js, Express, TypeScript, and PostgreSQL. This enterprise-grade solution provides robust security features including JWT-based authentication, role-based access control, email verification, password reset functionality, and advanced security logging.

## 🚀 Features

- **User Authentication**: Registration, login, logout with JWT tokens
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA with backup codes and QR code setup
- **Role-Based Access Control**: Three roles (Admin, User, Accountant) with specific permissions
- **Email Verification**: Secure email verification system with professional HTML templates
- **Password Reset**: Forgot password functionality with secure tokens
- **Session Management**: JWT refresh tokens for persistent sessions
- **Security Logging**: Failed login attempt tracking with IP address logging
- **Professional Email Templates**: Responsive HTML emails with modern CSS styling
- **Rate Limiting**: Prevents brute force attacks with Redis-backed rate limiting
- **Input Validation & Sanitization**: Comprehensive request validation and XSS protection
- **Performance Monitoring**: Comprehensive performance metrics and monitoring system
- **API Versioning**: Professional versioned API structure with v1 routes
- **Environment Validation**: Startup validation of all required environment variables
- **Input Sanitization**: Comprehensive XSS protection and input validation
- **Type Safety**: Full TypeScript type coverage with proper interfaces
- **Error Standardization**: Consistent error response format across all endpoints

## 🏗️ Project Structure

```
backend/
├── auth_module/                    # Main application module
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Authentication logic
│   │   │   ├── mfaController.ts    # Multi-factor authentication logic
│   │   │   └── userController.ts   # User management logic
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication middleware
│   │   │   ├── authorization.ts   # Role-based authorization
│   │   │   ├── validation.ts      # Input validation middleware
│   │   │   ├── errorHandler.ts    # Global error handling
│   │   │   ├── rateLimiter.ts     # Rate limiting middleware
│   │   │   ├── sanitization.ts    # Input sanitization middleware
│   │   │   └── index.ts           # Middleware exports
│   │   ├── routes/
│   │   │   ├── v1/                    # Versioned API routes
│   │   │   │   ├── authRoutes.ts      # Authentication routes (v1)
│   │   │   │   ├── mfaRoutes.ts       # Multi-factor authentication routes (v1)
│   │   │   │   ├── userRoutes.ts      # User management routes (v1)
│   │   │   │   └── performanceRoutes.ts # Performance monitoring routes (v1)
│   │   │   └── index.ts               # Route exports
│   │   ├── config/
│   │   │   ├── jwt.ts             # JWT configuration
│   │   │   ├── prisma.ts          # Prisma client configuration
│   │   │   └── redis.ts           # Redis configuration
│   │   ├── utils/
│   │   │   ├── passwordUtils.ts   # Password hashing utilities
│   │   │   ├── emailUtils.ts      # Email sending utilities (Resend)
│   │   │   ├── mfaUtils.ts        # Multi-factor authentication utilities
│   │   │   ├── roleUtils.ts       # Role validation utilities
│   │   │   ├── logger.ts          # Failed login logging utility
│   │   │   └── envValidation.ts   # Environment variable validation
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   ├── app.ts                 # Express app configuration
│   │   └── server.ts              # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── scripts/
│   │   └── generate-secrets.js    # JWT secret generation script
│   ├── package.json               # Dependencies and scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── .eslintrc.js               # ESLint configuration
│   ├── .gitignore                 # Git ignore rules
│   ├── README.md                  # Module documentation
│   └── API_DOCUMENTATION.md       # API documentation
├── volumes/                       # Persistent data storage
│   ├── postgres/                  # PostgreSQL data
│   ├── redis/                     # Redis data
│   └── logs/                      # Application logs (failed logins)
├── docker-compose.yml             # Docker services configuration
├── .env                           # Environment variables
├── .env.example                   # Environment variables template
├── .gitignore                     # Root git ignore rules
├── tsconfig.json                  # Root TypeScript configuration
└── README.md                      # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma with type-safe database operations
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Password Hashing**: bcryptjs
- **Email Service**: Resend with professional HTML templates
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Containerization**: Docker & Docker Compose
- **Development**: nodemon, ESLint
- **Logging**: Custom failed login logging with IP tracking

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Matthew-kabiu/Authentication-Template.git
cd Authentication-Template/backend
```

### 2. Environment Setup

```bash
# Copy environment variables template
cp .env.example .env

# Edit .env file with your configuration
# Make sure to set up your Resend API key for email functionality
```

### 3. Install Dependencies

```bash
cd auth_module
npm install
```

### 4. Start Docker Services

```bash
# From the backend root directory
docker-compose up -d
```

### 5. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
POSTGRES_DB=auth_db
POSTGRES_USER=auth_user
POSTGRES_PASSWORD=auth_password
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key-here
RESEND_FROM_EMAIL=your-email@yourdomain.com
RESEND_FROM_NAME=Your App Name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Application URLs
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password-here
```

## 🗄️ Database Schema

### User Model

```prisma
enum UserRole {
  ADMIN
  USER
  ACCOUNTANT
}

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String
  firstName             String?
  lastName              String?
  role                  UserRole  @default(USER)
  isEmailVerified       Boolean   @default(false)
  emailVerificationToken String?
  passwordResetToken    String?
  passwordResetExpires  DateTime?
  refreshToken          String?
  
  // MFA (Multi-Factor Authentication) fields
  mfaEnabled            Boolean   @default(false)
  mfaSecret             String?   // TOTP secret key
  mfaBackupCodes        String[]  // Array of backup codes for account recovery
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

## 🔐 Authentication System

### User Roles

- **ADMIN**: Full system access, user management, system settings
- **USER**: Basic user functionality, profile management
- **ACCOUNTANT**: Financial data access, reporting capabilities

### Authentication Flow

1. **Registration**: User registers with email and password
2. **Email Verification**: User receives professionally styled verification email
3. **Login**: User logs in with email and password
4. **MFA Verification**: If MFA is enabled, user provides TOTP code or backup code
5. **Failed Login Logging**: All failed attempts are logged with IP addresses
6. **JWT Tokens**: Access token (15min) + Refresh token (7 days)
7. **Token Refresh**: Automatic token renewal using refresh token

## 🔐 Multi-Factor Authentication (MFA)

### Overview

The authentication system includes comprehensive Multi-Factor Authentication (MFA) support using Time-based One-Time Passwords (TOTP) with backup codes for account recovery.

### MFA Features

- **TOTP Support**: Compatible with Google Authenticator, Authy, and other TOTP apps
- **QR Code Generation**: Automatic QR code generation for easy setup
- **Backup Codes**: 5 single-use backup codes for account recovery
- **Secure Storage**: MFA secrets are encrypted and stored securely
- **Account Recovery**: Backup codes can be used when TOTP device is unavailable

### MFA Setup Process

1. **Initiate Setup**: User requests MFA setup via API
2. **Generate Secret**: System generates a unique TOTP secret
3. **QR Code**: User scans QR code with authenticator app
4. **Verification**: User enters TOTP code to verify setup
5. **Backup Codes**: System generates and displays backup codes
6. **Activation**: MFA is enabled for the user account

### MFA Login Process

1. **Standard Login**: User enters email and password
2. **MFA Check**: System checks if MFA is enabled for user
3. **MFA Prompt**: If enabled, system requests TOTP code or backup code
4. **Verification**: System verifies the provided code
5. **Token Generation**: Upon successful verification, JWT tokens are issued
6. **Backup Code Cleanup**: Used backup codes are automatically removed

### MFA Management

- **Enable/Disable**: Users can enable or disable MFA (requires password verification)
- **Regenerate Backup Codes**: Users can generate new backup codes
- **Status Check**: Users can check MFA status and remaining backup codes
- **Secure Disable**: MFA can only be disabled with password verification

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```
GET  /api/health                 # API health status (not versioned)
```

### Public Routes

```
POST /api/v1/auth/register          # User registration
POST /api/v1/auth/login             # User login (with failed attempt logging)
POST /api/v1/auth/login/complete    # Complete login after MFA verification
POST /api/v1/auth/logout            # User logout
POST /api/v1/auth/refresh           # Refresh access token
POST /api/v1/auth/forgot-password   # Request password reset
POST /api/v1/auth/reset-password    # Reset password
POST /api/v1/auth/verify-email      # Verify email address
```

### Protected Routes (All authenticated users)

```
GET  /api/v1/auth/me                # Get current user profile
POST /api/v1/auth/change-password   # Change user password
```

### MFA Routes

#### Authenticated MFA Routes
```
POST /api/v1/auth/mfa/setup         # Initiate MFA setup
POST /api/v1/auth/mfa/verify-setup  # Verify MFA setup with TOTP code
POST /api/v1/auth/mfa/disable       # Disable MFA (requires password)
POST /api/v1/auth/mfa/backup-codes  # Generate new backup codes
GET  /api/v1/auth/mfa/status        # Get MFA status and backup codes count
POST /api/v1/auth/mfa/generate-qr   # Generate QR code for setup
```

#### Public MFA Routes
```
POST /api/v1/auth/mfa/verify-login  # Verify MFA during login (public)
GET  /api/v1/auth/mfa/qr/:secret/:email  # Get QR code as image (public)
```

### User Management Routes (All authenticated users)

```
GET    /api/v1/users                # Get all users (Admin only)
GET    /api/v1/users/stats          # Get user statistics (Admin only)
GET    /api/v1/users/:userId        # Get user by ID (Admin/Accountant/Own)
PUT    /api/v1/users/:userId        # Update user (Admin/Own)
PATCH  /api/v1/users/:userId/role   # Change user role (Admin only)
DELETE /api/v1/users/:userId        # Delete user (Admin only)
POST   /api/v1/users/:userId/resend-verification  # Resend verification email (Admin only)
```

### Performance Monitoring Routes (Admin only)

```
GET /api/v1/admin/performance/:endpoint           # Get performance metrics
GET /api/v1/admin/performance/:endpoint/stats     # Get performance statistics
GET /api/v1/admin/performance/endpoints           # Get all monitored endpoints
GET /api/v1/admin/performance/summary             # Get system performance summary
```

## 🚀 User Journey & Authentication Flows

### 1. User Registration Flow

#### Step 1: User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Step 2: Email Verification
User receives professional HTML email with verification link. When clicked:

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### 2. User Login Flow (Without MFA)

#### Standard Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": true
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 3. User Login Flow (With MFA Enabled)

#### Step 1: Initial Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (MFA Required):**
```json
{
  "message": "MFA verification required",
  "mfaRequired": true,
  "email": "user@example.com"
}
```

#### Step 2: MFA Verification
```http
POST /api/v1/auth/mfa/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "MFA verification successful",
  "mfaVerified": true
}
```

#### Step 3: Complete Login
```http
POST /api/v1/auth/login/complete
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Login completed successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": true
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 4. MFA Setup Flow

#### Step 1: Initiate MFA Setup
```http
POST /api/v1/auth/mfa/setup
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "MFA setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "userEmail": "user@example.com",
  "setupComplete": false,
  "qrCodeEndpoint": "/api/v1/auth/mfa/qr/JBSWY3DPEHPK3PXP/user%40example.com"
}
```

#### Step 2: Generate QR Code
```http
POST /api/v1/auth/mfa/generate-qr
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "secret": "JBSWY3DPEHPK3PXP",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Step 3: Verify MFA Setup
User scans QR code with authenticator app and enters TOTP code:

```http
POST /api/v1/auth/mfa/verify-setup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "MFA enabled successfully",
  "backupCodes": "1. ABC12345\n2. DEF67890\n3. GHI13579\n4. JKL24680\n5. MNO97531",
  "setupComplete": true
}
```

### 5. Password Reset Flow

#### Step 1: Request Password Reset
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### Step 2: Reset Password
User clicks link in email and submits new password:

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### 6. Token Refresh Flow

#### Refresh Access Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "tokens": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### 7. User Management Flow (Admin)

#### Get All Users
```http
GET /api/v1/users?page=1&limit=10&role=USER&search=john
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Update User Role
```http
PATCH /api/v1/users/:userId/role
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "role": "ACCOUNTANT"
}
```

**Response:**
```json
{
  "message": "User role updated successfully"
}
```

### 8. Performance Monitoring Flow (Admin)

#### Get Performance Metrics
```http
GET /api/v1/admin/performance/auth/login?method=POST&timeRange=3600000
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "endpoint": "/auth/login",
    "method": "POST",
    "timeRange": 3600000,
    "metrics": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "responseTime": 150,
        "statusCode": 200,
        "memoryUsage": 45.2
      }
    ],
    "count": 1
  }
}
```

### 9. Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/login",
  "details": {
    "field": "email",
    "message": "Valid email is required"
  }
}
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: express-validator for data sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: helmet.js for HTTP security headers
- **Failed Login Logging**: Tracks failed login attempts with IP addresses
- **Professional Email Templates**: Responsive HTML emails with modern styling
- **Token Expiration**: Short-lived access tokens with refresh mechanism

## 📧 Email System

### Features

- **Professional HTML Templates**: Modern, responsive email design
- **Resend Integration**: Reliable email delivery service
- **Verification Emails**: Beautiful account verification emails
- **Password Reset**: Secure password reset functionality
- **Mobile Responsive**: Optimized for all devices

### Email Templates

- **Account Verification**: Purple gradient theme with clear call-to-action
- **Password Reset**: Pink/red gradient theme with security warnings
- **Fallback Support**: Plain text versions for all emails

## 📊 Logging System

### Failed Login Tracking

- **IP Address Logging**: Tracks IP addresses of failed login attempts
- **Timestamp Recording**: Detailed timestamps for security analysis
- **File-based Storage**: Logs stored in `volumes/logs/failed_logins.log`
- **Security Monitoring**: Enables security analysis and threat detection

### Log Format

```
[2024-01-15T10:30:45.123Z] Failed login attempt for email: user@example.com from IP: [REDACTED]
[2024-01-15T10:31:12.456Z] Failed login attempt for email: admin@test.com from IP: [REDACTED]
```

## 🐳 Docker Setup

### Development

```bash
# Start all services (PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services

- **PostgreSQL**: Database service with persistent storage
- **Redis**: Caching and session storage
- **Application**: Node.js application with hot reload

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon
npm run start            # Start production server
npm run build            # Build TypeScript to JavaScript

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs

# Security
npm run generate-secrets # Generate JWT secrets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 API Documentation

### Request/Response Examples

#### User Registration

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123def456..."
  }
}
```

#### User Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Protected Route Example

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### MFA Setup Example

```http
POST /api/v1/auth/mfa/setup
Authorization: Bearer <access_token>
Content-Type: application/json

# Response:
{
  "message": "MFA setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "userEmail": "user@example.com",
  "setupComplete": false,
  "qrCodeEndpoint": "/api/v1/auth/mfa/qr/JBSWY3DPEHPK3PXP/user%40example.com"
}
```

#### MFA Verification Example

```http
POST /api/v1/auth/mfa/verify-setup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}

# Response:
{
  "message": "MFA enabled successfully",
  "backupCodes": "1. ABC12345\n2. DEF67890\n3. GHI13579\n4. JKL24680\n5. MNO97531",
  "setupComplete": true
}
```

#### MFA Login Example

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response (if MFA enabled):
{
  "message": "MFA verification required",
  "mfaRequired": true,
  "email": "user@example.com"
}

# Then verify MFA:
POST /api/v1/auth/mfa/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}

# Response:
{
  "message": "MFA verification successful",
  "mfaVerified": true
}

# Finally complete login:
POST /api/v1/auth/login/complete
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 🚀 Deployment

### Coolify Deployment

This application is configured for deployment via Coolify:

1. **Database**: PostgreSQL service with persistent storage
2. **Application**: Node.js service with TypeScript
3. **Environment Variables**: Configure via Coolify dashboard
4. **SSL**: Automatic SSL certificate management
5. **Logging**: Failed login monitoring and security logs

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔄 Recent Updates

### Version 3.0.0 (Current)

- ✅ **API Versioning**: Professional versioned API structure with v1 routes
- ✅ **Performance Monitoring**: Comprehensive performance metrics and monitoring system
- ✅ **Code Quality**: Clean, maintainable code structure with proper organization
- ✅ **Template Readiness**: Professional-grade template ready for production use
- ✅ **Future-Proof Architecture**: Easy to extend with v2 features when needed

### Version 2.0.0

- ✅ **Multi-Factor Authentication (MFA)**: Complete TOTP-based 2FA implementation
- ✅ **MFA Management**: Setup, verification, backup codes, and QR code generation
- ✅ **Environment Validation**: Comprehensive startup validation of all required variables
- ✅ **Input Sanitization**: XSS protection and comprehensive input validation
- ✅ **Type Safety**: Full TypeScript type coverage with proper interfaces
- ✅ **Error Standardization**: Consistent error response format across all endpoints
- ✅ **Security Enhancements**: Removed debug endpoints and sensitive logging
- ✅ **Code Quality**: Improved error handling and middleware organization

### Version 1.1.0

- ✅ Added failed login attempt logging with IP address tracking
- ✅ Implemented professional HTML email templates with responsive design
- ✅ Enhanced security with detailed logging system
- ✅ Improved email delivery with Resend integration
- ✅ Added comprehensive error handling and debugging
- ✅ Updated project structure for better organization

### Version 1.0.0

- ✅ Initial authentication system
- ✅ Role-based access control
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Docker support with PostgreSQL and Redis
- ✅ TypeScript implementation
- ✅ Prisma ORM integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built by SpookieLabsInc for secure authentication systems**

_This authentication system provides enterprise-grade security with modern development practices, comprehensive logging, and professional user experience._
