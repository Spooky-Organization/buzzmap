# Authentication Template Backend

A comprehensive, production-ready authentication system built with Node.js, Express, TypeScript, and PostgreSQL. This enterprise-grade solution provides robust security features including JWT-based authentication, role-based access control, email verification, password reset functionality, and advanced security logging.

## 🚀 Features

- **User Authentication**: Registration, login, logout with JWT tokens
- **Role-Based Access Control**: Three roles (Admin, User, Accountant) with specific permissions
- **Email Verification**: Secure email verification system with professional HTML templates
- **Password Reset**: Forgot password functionality with secure tokens
- **Session Management**: JWT refresh tokens for persistent sessions
- **Security Logging**: Failed login attempt tracking with IP address logging
- **Professional Email Templates**: Responsive HTML emails with modern CSS styling
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Global error handling with detailed logging
- **Database**: PostgreSQL with Prisma ORM for type-safe operations
- **Docker**: Containerized development environment with Docker Compose
- **TypeScript**: Full TypeScript implementation for enhanced code quality

## 🏗️ Project Structure

```
backend/
├── auth_module/                    # Main application module
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Authentication logic
│   │   │   └── userController.ts   # User management logic
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication middleware
│   │   │   ├── authorization.ts   # Role-based authorization
│   │   │   ├── validation.ts      # Input validation middleware
│   │   │   ├── errorHandler.ts    # Global error handling
│   │   │   ├── rateLimiter.ts     # Rate limiting middleware
│   │   │   └── index.ts           # Middleware exports
│   │   ├── routes/
│   │   │   ├── authRoutes.ts      # Authentication routes
│   │   │   ├── userRoutes.ts      # User management routes
│   │   │   └── index.ts           # Route exports
│   │   ├── config/
│   │   │   ├── jwt.ts             # JWT configuration
│   │   │   ├── prisma.ts          # Prisma client configuration
│   │   │   └── redis.ts           # Redis configuration
│   │   ├── utils/
│   │   │   ├── passwordUtils.ts   # Password hashing utilities
│   │   │   ├── emailUtils.ts      # Email sending utilities (Resend)
│   │   │   ├── roleUtils.ts       # Role validation utilities
│   │   │   └── logger.ts          # Failed login logging utility
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

The server will start at `http://localhost:5000`

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
POSTGRES_DB=auth_db
POSTGRES_USER=auth_user
POSTGRES_PASSWORD=auth_password
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Auth System

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
REDIS_PASSWORD=your-redis-password
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
4. **Failed Login Logging**: All failed attempts are logged with IP addresses
5. **JWT Tokens**: Access token (15min) + Refresh token (7 days)
6. **Token Refresh**: Automatic token renewal using refresh token

## 📡 API Endpoints

### Public Routes

```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login (with failed attempt logging)
POST /api/auth/logout            # User logout
POST /api/auth/refresh           # Refresh access token
POST /api/auth/forgot-password   # Request password reset
POST /api/auth/reset-password    # Reset password
POST /api/auth/verify-email      # Verify email address
```

### Protected Routes (All authenticated users)

```
GET  /api/auth/me                # Get current user profile
POST /api/auth/change-password   # Change user password
PUT  /api/users/profile          # Update user profile
DELETE /api/users/account        # Delete user account
```

### Admin Routes (Admin only)

```
GET    /api/admin/users          # Get all users
PUT    /api/admin/users/:id      # Update user
DELETE /api/admin/users/:id      # Delete user
POST   /api/admin/users/:id/change-role  # Change user role
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
[2024-01-15T10:30:45.123Z] Failed login attempt for email: user@example.com from IP: 192.168.1.100
[2024-01-15T10:31:12.456Z] Failed login attempt for email: admin@test.com from IP: unknown
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
POST /api/auth/register
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
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Protected Route Example

```http
GET /api/auth/me
Authorization: Bearer <access_token>
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

**Built with ❤️ for secure authentication systems**

_This authentication system provides enterprise-grade security with modern development practices, comprehensive logging, and professional user experience._
