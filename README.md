# Dashboard Template

<div align="center">

**Production-Ready Authentication System for Modern Applications**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Express.js, Node.js, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Email:** Resend
- **DevOps:** Docker, Docker Compose

---

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## Overview

**Dashboard Template** is a complete, enterprise-grade authentication system that saves weeks of development time. Built with modern technologies and security best practices, it provides everything you need for secure user authentication, authorization, and session management out of the box.

### Why Choose This Template?

- **Save Weeks of Development** - Get a production-ready auth system in minutes, not months
- **Enterprise Security** - OWASP Top 10 compliant with comprehensive security measures
- **Production Ready** - Battle-tested code with best practices built-in
- **Complete Solution** - Frontend UI, backend API, database, and deployment configs included
- **Modern Stack** - TypeScript, React 18, Express, PostgreSQL, Redis, Docker
- **Well Documented** - Comprehensive documentation for developers and stakeholders

---

## Features

### Authentication & Security

- **JWT-Based Authentication** - Secure token-based auth with automatic refresh
- **Multi-Factor Authentication (MFA)** - TOTP-based 2FA with backup codes and QR code generation
- **Role-Based Access Control (RBAC)** - Flexible system with USER, ACCOUNTANT, and ADMIN roles
- **Password Management** - Secure password reset, change, and strength validation
- **Email Verification** - Complete email verification flow with Resend integration
- **Session Management** - Secure session handling with Redis-backed storage
- **Rate Limiting** - Multi-tier rate limiting (100/15min general, 5/15min auth, 3/hour password reset)
- **Input Sanitization** - XSS protection with DOMPurify and HTML entity encoding
- **Security Headers** - Helmet middleware with comprehensive security headers
- **Production-Grade Encryption** - bcrypt (cost 12), AES-256-GCM for MFA secrets, TLS 1.3
- **Account Protection** - Automatic lockout after 4 failed attempts, permanent ban after 6 attempts

### Frontend Features

- **Real-Time Updates** - Server-Sent Events (SSE) client for live notifications and dashboard updates
- **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **13+ Implemented Pages** - Complete authentication flow and dashboards
- **Role-Based Dashboards** - Customized dashboards for each user role
- **Form Validation** - Real-time validation with visual feedback
- **Password Strength Indicators** - Visual password strength feedback
- **Mobile Responsive** - Fully responsive design for all devices
- **Accessible** - WCAG 2.1 AA compliant components

### Backend Features

- **Real-Time with SSE** - Server-Sent Events for live updates (notifications, activity logs, dashboard metrics)
- **RESTful API** - 30+ well-documented API endpoints
- **API Versioning** - Versioned routes (`/api/v1`) with backward compatibility
- **Performance Monitoring** - Built-in performance metrics and monitoring
- **Error Handling** - Comprehensive error handling with typed responses
- **Database Migrations** - Automated Prisma migrations
- **Logging** - Structured logging for debugging and monitoring

### DevOps & Deployment

- **Docker Support** - Complete Docker setup for development and production
- **Docker Compose** - Orchestrated multi-container setup
- **Multi-Stage Builds** - Optimized production builds
- **Health Checks** - Service health monitoring
- **Hot Reload** - Development environment with live code updates
- **Environment Management** - Separate dev and prod configurations

---

## Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** and **Docker Compose** (recommended)
- **PostgreSQL** 15+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

### Option 1: Docker (Recommended)

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/Spooky-Organization/Authentication-Template.git
cd Authentication-Template

# Start development environment
./dev.sh start

# Access the application
# Frontend: http://localhost:3014
# Backend API: http://localhost:5000/api/v1
# Prisma Studio: http://localhost:5555
```

### Option 2: Local Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your configuration

# Start backend
cd backend
npm run db:generate
npm run db:migrate
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### First Steps

1. **Register a new account** at `http://localhost:3014/register`
2. **Verify your email** (check console logs in development)
3. **Login** and explore the dashboard
4. **Set up MFA** from the profile page
5. **Explore the API** at `http://localhost:5000/api/v1`

---

## Project Structure

```
Authentication-Template/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API client with interceptors
│   │   ├── auth/            # Session and token management
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Routing configuration
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
│
├── backend/                 # Express backend application
│   ├── core/                # Express app configuration
│   ├── modules/             # Modular code organization
│   │   └── auth_module/     # Authentication module
│   │       └── src/
│   │           ├── controllers/ # Request handlers
│   │           ├── middleware/  # Express middleware
│   │           ├── routes/      # API routes
│   │           └── utils/       # Utility functions
│   └── prisma/              # Database schema and migrations
│
├── docs/                    # Comprehensive documentation
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   ├── FRONTEND_README.md    # Frontend architecture
│   ├── DOCKER_SETUP.md       # Docker setup guide
│   └── ENVIRONMENT_SETUP.md  # Environment configuration
│
├── docker-compose.dev.yml   # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
├── dev.sh                   # Development helper script
└── prod.sh                  # Production helper script
```

---

## Architecture

### High-Level Overview

```
┌─────────────┐      HTTP/REST      ┌─────────────┐
│   Frontend  │ ◄─────────────────► │   Backend   │
│   (React)   │      API Calls       │  (Express)  │
└─────────────┘                      └──────┬──────┘
                                            │
                            ┌───────────────┼───────────────┐
                            │               │               │
                            ▼               ▼               ▼
                    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                    │ PostgreSQL  │  │    Redis    │  │   Resend    │
                    │  (Database) │  │   (Cache)   │  │   (Email)   │
                    └─────────────┘  └─────────────┘  └─────────────┘
```

### Backend Architecture

The backend follows a **modular architecture** pattern:

- **`core/`** - Express application configuration and server setup
- **`modules/`** - Modular code organization
  - **`auth_module/`** - Self-contained authentication module
    - Controllers for request handling
    - Middleware for authentication, authorization, validation
    - Routes organized by API version
    - Utilities for password, email, MFA, etc.
- **`prisma/`** - Database schema and migrations

### Frontend Architecture

The frontend uses a **component-based architecture**:

- **Singleton Patterns** - API Client, Session Manager, Token Manager
- **Component Library** - Reusable UI components
- **Layout System** - Common DashboardLayout for consistency
- **Route Guards** - Authentication and role-based protection
- **Form Validation** - Centralized validation manager

### Security Architecture

- **Authentication Layer** - JWT tokens with refresh rotation
- **Authorization Layer** - Role-based access control
- **Rate Limiting** - Multi-tier Redis-backed protection
- **Input Sanitization** - XSS protection at multiple layers
- **Security Headers** - Helmet middleware configuration
- **Session Management** - Redis-backed secure sessions
- **Encryption Layer** - bcrypt (cost 12), AES-256-GCM, TLS 1.3

---

## Configuration

### Environment Variables

#### Frontend (`.env.development` for dev, `.env.prod` for prod)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Dashboard Template
VITE_ENVIRONMENT=development
```

#### Backend (`.env.development` or `.env.prod`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@example.com

# Server
PORT=5000
CORS_ORIGIN=http://localhost:3014
```

See [Environment Setup Documentation](docs/ENVIRONMENT_SETUP.md) for complete configuration details.

---

## Documentation

### For Developers

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API endpoint reference with examples
- **[Frontend README](docs/FRONTEND_README.md)** - Frontend architecture, components, and setup
- **[Backend README](frontend/public/docs/README.md)** - Backend structure, module organization, and guidelines
- **[Docker Setup](docs/DOCKER_SETUP.md)** - Docker configuration and deployment
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Comprehensive environment configuration guide
- **[Encryption Documentation](docs/ENCRYPTION.md)** - Encryption mechanisms, key management, and security implementation

### For Business Stakeholders

- **Security Compliance** - OWASP Top 10 compliant, enterprise-grade security
- **Scalability** - Modular architecture designed for growth
- **Maintainability** - Well-documented codebase with clear structure
- **Time to Market** - Save weeks of development time
- **Production Ready** - Battle-tested code with best practices

---

## Development

### Available Scripts

#### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

#### Frontend

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Docker Commands

```bash
# Development (uses .env.development automatically)
./dev.sh start               # Start development environment (builds and runs in detached mode)
./dev.sh stop                # Stop services
./dev.sh restart             # Restart services
./dev.sh logs -f             # Follow logs in real-time
./dev.sh logs backend        # View logs for specific service
./dev.sh status              # Check service status
./dev.sh help                # Show all available commands

# Production (uses .env.prod automatically)
./prod.sh start              # Start production environment (builds and runs in detached mode)
./prod.sh stop               # Stop services
./prod.sh restart            # Restart services
./prod.sh logs -f            # Follow logs in real-time
./prod.sh logs backend       # View logs for specific service
./prod.sh status             # Check service status
./prod.sh help               # Show all available commands
```

---

## Security Features

### OWASP Top 10 Compliance

- **Injection Protection** - Parameterized queries, input validation
- **Broken Authentication** - Secure password hashing, JWT rotation
- **Sensitive Data Exposure** - Encrypted tokens, secure storage
- **XML External Entities** - Not applicable (JSON only)
- **Broken Access Control** - Role-based authorization middleware
- **Security Misconfiguration** - Security headers, secure defaults
- **XSS Protection** - DOMPurify sanitization, CSP headers
- **Insecure Deserialization** - JSON validation, type checking
- **Using Components with Known Vulnerabilities** - Regular dependency updates
- **Insufficient Logging** - Comprehensive logging and monitoring

### Additional Security Measures

- **Rate Limiting** - Multi-tier protection against brute force attacks
- **CORS Protection** - Configurable CORS policies
- **Security Headers** - Helmet middleware with comprehensive headers
- **Password Policies** - Strength requirements and validation
- **Token Security** - Secure storage, automatic rotation, expiration
- **Session Management** - Redis-backed secure session storage
- **Encryption** - bcrypt (cost 12), AES-256-GCM for MFA secrets, TLS 1.3
- **Account Lockout** - Auto-lock after 4 failed attempts, permanent ban after 6

---

## API Overview

The backend provides **30+ RESTful endpoints** organized by functionality:

### Authentication Endpoints (9)
- Register, Login, Logout
- Password Reset & Recovery
- Email Verification
- Token Refresh
- Change Password

### MFA Endpoints (8)
- Setup & Configuration
- TOTP Verification
- Login Flow Integration
- Backup Codes Management
- QR Code Generation

### User Management Endpoints (7)
- CRUD Operations
- Role Management (Admin)
- User Statistics
- Admin Features

### Performance Endpoints (4)
- Metrics & Statistics
- Endpoint Monitoring
- System Summary
- Health Checks

See [API Documentation](docs/API_DOCUMENTATION.md) for complete endpoint reference.

---

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Manual Testing

1. **Authentication Flow**
   - Register → Verify Email → Login → Dashboard
   - Forgot Password → Reset Password → Login
   - Change Password (authenticated)

2. **MFA Flow**
   - Setup MFA → Scan QR Code → Verify Setup
   - Login with MFA → Enter TOTP Code

3. **Role-Based Access**
   - Test different user roles (USER, ACCOUNTANT, ADMIN)
   - Verify dashboard access and navigation

---

## Deployment

### Production Deployment

1. **Prepare Environment**
   ```bash
   # Edit .env.prod with production values
   ```

2. **Build and Deploy**
   ```bash
   ./prod.sh start
   ```

3. **Verify Deployment**
   ```bash
   curl http://localhost:3014/health      # Frontend
   curl http://localhost:5001/api/health  # Backend
   ```

### Environment-Specific Configuration

- **Development** - Hot reload, verbose errors, debugging tools
- **Production** - Optimized builds, security headers, resource limits

See [Docker Setup](docs/DOCKER_SETUP.md) and [Environment Setup](docs/ENVIRONMENT_SETUP.md) for detailed deployment guides.

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code style** - TypeScript strict mode, ESLint rules
4. **Write tests** for new features
5. **Update documentation** as needed
6. **Commit changes** (`git commit -m 'Add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Follow configured rules
- **Component Structure** - Follow existing patterns
- **Module Organization** - Follow backend module structure guidelines

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with modern technologies and best practices
- Inspired by industry-standard authentication patterns
- Designed for scalability and maintainability

---

## Support

For questions, issues, or contributions:

- **Documentation** - Check the [docs](docs/) directory
- **Issues** - Open an issue on GitHub
- **Discussions** - Join the GitHub Discussions

---

## Roadmap

### Current Status

- Complete authentication system
- Multi-factor authentication
- Role-based access control
- Frontend UI/UX
- Docker deployment
- Comprehensive documentation

### Future Enhancements

- [ ] Social authentication (OAuth)
- [ ] Advanced analytics dashboard
- [ ] Email templates customization
- [ ] Webhook support
- [ ] GraphQL API option
- [ ] Mobile app support

---

<div align="center">

**© 2024 Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

[⬆ Back to Top](#authentication-template)

</div>

