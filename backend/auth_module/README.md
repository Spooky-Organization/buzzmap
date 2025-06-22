# Authentication Template Backend

A robust Node.js and Express authentication system with role-based access control, built with PostgreSQL, Prisma ORM, and Docker.

## 🚀 Features

- **User Authentication**: Registration, login, logout with JWT tokens
- **Role-Based Access Control**: Three roles (Admin, User, Accountant)
- **Email Verification**: Secure email verification system
- **Password Reset**: Forgot password functionality with secure tokens
- **Session Management**: JWT refresh tokens for persistent sessions
- **Security**: Rate limiting, input validation, CORS, security headers
- **Database**: PostgreSQL with Prisma ORM
- **Docker**: Containerized development environment

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   └── userController.js      # User management logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── roleAuth.js           # Role-based authorization
│   │   ├── validation.js         # Input validation middleware
│   │   └── errorHandler.js       # Global error handling
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User management routes
│   │   └── admin.js              # Admin-only routes
│   ├── config/
│   │   ├── database.js           # Database configuration
│   │   └── jwt.js                # JWT configuration
│   ├── utils/
│   │   ├── passwordUtils.js      # Password hashing utilities
│   │   ├── emailUtils.js         # Email sending utilities
│   │   └── roleUtils.js          # Role validation utilities
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   └── app.js                    # Express app configuration
├── docker/
│   ├── docker-compose.yml        # Docker services configuration
│   └── Dockerfile                # Application container
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
└── server.js                     # Application entry point
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Containerization**: Docker & Docker Compose
- **Development**: nodemon

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Environment Setup

```bash
# Copy environment variables template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Docker Services

```bash
# Start PostgreSQL database
docker-compose up -d
```

### 5. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with initial data
npx prisma db seed
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
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for email verification and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
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
2. **Email Verification**: User receives verification email
3. **Login**: User logs in with email and password
4. **JWT Tokens**: Access token (15min) + Refresh token (7 days)
5. **Token Refresh**: Automatic token renewal using refresh token

## 📡 API Endpoints

### Public Routes

```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/refresh           # Refresh access token
POST /api/auth/forgot-password   # Request password reset
POST /api/auth/reset-password    # Reset password
POST /api/auth/verify-email      # Verify email address
```

### Protected Routes (All authenticated users)

```
GET  /api/auth/me                # Get current user profile
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

### Accountant Routes (Accountant only)

```
GET /api/accountant/reports      # Get financial reports
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: express-validator for data sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: helmet.js for HTTP security headers
- **Token Expiration**: Short-lived access tokens with refresh mechanism

## 🐳 Docker Setup

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
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

1. **Database**: PostgreSQL service
2. **Application**: Node.js service
3. **Environment Variables**: Configure via Coolify dashboard
4. **SSL**: Automatic SSL certificate management

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

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

## 🔄 Changelog

### Version 1.0.0

- Initial release
- User authentication system
- Role-based access control
- Email verification
- Password reset functionality
- Docker support
- PostgreSQL with Prisma ORM

---

**Built with ❤️ for secure authentication systems**
