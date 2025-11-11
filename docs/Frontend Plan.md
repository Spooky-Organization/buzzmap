# Frontend Implementation Plan

## Overview

This document outlines the core frontend implementation plan for the Authentication Template. The frontend will implement authentication, MFA, and user management endpoints, provide secure session management, and include comprehensive security measures following OWASP Top 10 guidelines.

**Focus:** Core functionality - Authentication, MFA, User Management, and Session Management across the stack.

## Technology Stack

### Core Framework
- **React 18+** with TypeScript
- **React Router v6** for routing
- **Zustand** or **React Context** for state management (lightweight)

### HTTP & API
- **Axios** with interceptors for API calls
- **Singleton API Client** pattern for centralized API management

### Forms & Validation
- **React Hook Form** for form handling
- **Zod** for schema validation

### Security
- **DOMPurify** for XSS protection
- **Content Security Policy (CSP)** headers
- Secure token storage mechanisms

### UI & Styling
- **Tailwind CSS** for styling
- **shadcn/ui** or similar component library

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # Singleton API Client
│   │   ├── endpoints.ts           # API endpoint constants
│   │   └── types.ts               # API response types
│   │
│   ├── auth/
│   │   ├── sessionManager.ts      # Singleton Session Manager
│   │   ├── tokenManager.ts        # Token storage & refresh
│   │   └── authContext.tsx        # Auth context provider
│   │
│   ├── routes/
│   │   ├── router.tsx             # Singleton Router Hub
│   │   ├── routes.ts              # Route definitions
│   │   └── guards.tsx             # Route guards (auth, role-based)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   └── ChangePassword.tsx
│   │   ├── mfa/
│   │   │   ├── MFASetup.tsx
│   │   │   ├── MFAVerify.tsx
│   │   │   └── MFALogin.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── profile/
│   │   │   └── Profile.tsx
│   │   ├── admin/
│   │   │   ├── Users.tsx
│   │   │   └── UserDetails.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Toast.tsx
│   │   └── protected/
│   │       └── ProtectedComponent.tsx
│   │
│   ├── utils/
│   │   ├── security.ts            # XSS sanitization, validation
│   │   ├── validation.ts          # Form validation schemas
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   │
│   └── App.tsx
│
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── .env.example
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts (or webpack.config.js)
└── README.md
```

## Core Components

### 1. Singleton API Client

**Location:** `src/api/client.ts`

**Purpose:** Centralized HTTP client with automatic token management, request/response interceptors, and error handling.

**Features:**
- Automatic token injection in requests
- Token refresh on 401 errors
- Request/response interceptors
- Error handling and retry logic
- Type-safe API calls

**Implementation:**

```typescript
// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { SessionManager } from '../auth/sessionManager';

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private sessionManager: SessionManager;

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
    
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For secure cookies if needed
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.sessionManager.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.sessionManager.refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.sessionManager.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = ApiClient.getInstance();
```

### 2. Singleton Session Manager

**Location:** `src/auth/sessionManager.ts`

**Purpose:** Centralized session management with automatic token refresh, secure storage, and user state management.

**Features:**
- Automatic token refresh before expiry
- Secure token storage
- User state management
- Role-based access checks
- Session persistence

**Implementation:**

```typescript
// src/auth/sessionManager.ts
import { apiClient } from '../api/client';
import { TokenManager } from './tokenManager';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ACCOUNTANT' | 'ADMIN';
  isEmailVerified: boolean;
}

interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class SessionManager {
  private static instance: SessionManager;
  private tokenManager: TokenManager;
  private sessionData: SessionData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.initializeSession();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private initializeSession(): void {
    const stored = this.tokenManager.getStoredSession();
    if (stored) {
      this.sessionData = stored;
      this.scheduleTokenRefresh();
    }
  }

  public async login(email: string, password: string): Promise<SessionData> {
    try {
      const response = await apiClient.post<{
        message: string;
        user: User;
        tokens: { accessToken: string; refreshToken: string };
      }>('/auth/login', { email, password });

      this.sessionData = {
        user: response.user,
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: this.getTokenExpiry(response.tokens.accessToken),
      };

      this.tokenManager.storeSession(this.sessionData);
      this.scheduleTokenRefresh();

      return this.sessionData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<SessionData> {
    try {
      const response = await apiClient.post<{
        message: string;
        user: User;
        tokens: { accessToken: string; refreshToken: string };
      }>('/auth/register', data);

      this.sessionData = {
        user: response.user,
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: this.getTokenExpiry(response.tokens.accessToken),
      };

      this.tokenManager.storeSession(this.sessionData);
      this.scheduleTokenRefresh();

      return this.sessionData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async refreshToken(): Promise<string | null> {
    if (!this.sessionData?.refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<{
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      }>('/auth/refresh', {
        refreshToken: this.sessionData.refreshToken,
      });

      if (this.sessionData) {
        this.sessionData.accessToken = response.tokens.accessToken;
        this.sessionData.refreshToken = response.tokens.refreshToken;
        this.sessionData.expiresAt = this.getTokenExpiry(response.tokens.accessToken);
        this.tokenManager.storeSession(this.sessionData);
        this.scheduleTokenRefresh();
      }

      return response.tokens.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  public async logout(): Promise<void> {
    if (this.sessionData?.refreshToken) {
      try {
        await apiClient.post('/auth/logout', {
          refreshToken: this.sessionData.refreshToken,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.clearSession();
  }

  public getAccessToken(): string | null {
    return this.sessionData?.accessToken || null;
  }

  public getUser(): User | null {
    return this.sessionData?.user || null;
  }

  public isAuthenticated(): boolean {
    return !!this.sessionData && this.isTokenValid();
  }

  public hasRole(role: 'USER' | 'ACCOUNTANT' | 'ADMIN'): boolean {
    return this.sessionData?.user.role === role;
  }

  public isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private isTokenValid(): boolean {
    if (!this.sessionData) return false;
    return Date.now() < this.sessionData.expiresAt;
  }

  private getTokenExpiry(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.exp || 0) * 1000;
    } catch {
      return Date.now() + 15 * 60 * 1000; // Default 15 minutes
    }
  }

  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.sessionData) return;

    const timeUntilExpiry = this.sessionData.expiresAt - Date.now();
    const refreshTime = Math.max(0, timeUntilExpiry - this.REFRESH_THRESHOLD);

    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {
        this.logout();
      });
    }, refreshTime);
  }

  private clearSession(): void {
    this.sessionData = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.tokenManager.clearSession();
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'An error occurred');
  }
}

export { SessionManager };
export type { User, SessionData };
```

### 3. Token Manager (Secure Storage)

**Location:** `src/auth/tokenManager.ts`

**Purpose:** Secure token storage with XSS protection and data sanitization.

**Features:**
- XSS-safe storage
- Data sanitization
- localStorage/sessionStorage support
- Automatic cleanup

**Implementation:**

```typescript
// src/auth/tokenManager.ts
import DOMPurify from 'isomorphic-dompurify';

class TokenManager {
  private static instance: TokenManager;
  private readonly STORAGE_KEY = 'auth_session';
  private readonly STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

  private constructor() {
    // Use sessionStorage in production for better security
    if (import.meta.env.PROD) {
      this.STORAGE_TYPE = 'sessionStorage';
    }
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  public storeSession(session: any): void {
    try {
      const storage = window[this.STORAGE_TYPE];
      const sanitized = this.sanitizeData(session);
      storage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  public getStoredSession(): any | null {
    try {
      const storage = window[this.STORAGE_TYPE];
      const stored = storage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return this.sanitizeData(parsed);
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  public clearSession(): void {
    try {
      const storage = window[this.STORAGE_TYPE];
      storage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  private sanitizeData(data: any): any {
    // Sanitize all string values to prevent XSS
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data);
    }
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitized[key] = this.sanitizeData(data[key]);
        }
      }
      return sanitized;
    }
    return data;
  }
}

export { TokenManager };
```

### 4. Singleton Router Hub

**Location:** `src/routes/router.tsx`

**Purpose:** Centralized routing configuration and management.

**Features:**
- Single source of truth for routes
- Route guards integration
- Protected and public routes
- Role-based routing

**Implementation:**

```typescript
// src/routes/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { ProtectedRoute } from './guards';

class RouterManager {
  private static instance: RouterManager;
  private router: ReturnType<typeof createBrowserRouter> | null = null;

  private constructor() {
    this.initializeRouter();
  }

  public static getInstance(): RouterManager {
    if (!RouterManager.instance) {
      RouterManager.instance = new RouterManager();
    }
    return RouterManager.instance;
  }

  private initializeRouter(): void {
    this.router = createBrowserRouter(routes);
  }

  public getRouter(): ReturnType<typeof createBrowserRouter> {
    if (!this.router) {
      this.initializeRouter();
    }
    return this.router!;
  }

  public RouterProvider(): JSX.Element {
    return <RouterProvider router={this.getRouter()} />;
  }
}

export const routerManager = RouterManager.getInstance();
```

```typescript
// src/routes/routes.tsx
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './guards';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ChangePassword from '../pages/auth/ChangePassword';
import MFASetup from '../pages/mfa/MFASetup';
import MFAVerify from '../pages/mfa/MFAVerify';
import MFALogin from '../pages/mfa/MFALogin';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import Users from '../pages/admin/Users';
import UserDetails from '../pages/admin/UserDetails';
import NotFound from '../pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/mfa/setup',
    element: <ProtectedRoute><MFASetup /></ProtectedRoute>,
  },
  {
    path: '/mfa/verify',
    element: <MFAVerify />,
  },
  {
    path: '/mfa/login',
    element: <MFALogin />,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: '/change-password',
    element: <ProtectedRoute><ChangePassword /></ProtectedRoute>,
  },
  {
    path: '/admin/users',
    element: <AdminRoute><Users /></AdminRoute>,
  },
  {
    path: '/admin/users/:id',
    element: <AdminRoute><UserDetails /></AdminRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
```

### 5. Route Guards

**Location:** `src/routes/guards.tsx`

**Purpose:** Protect routes based on authentication and authorization.

**Implementation:**

```typescript
// src/routes/guards.tsx
import { Navigate } from 'react-router-dom';
import { SessionManager } from '../auth/sessionManager';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: 'USER' | 'ACCOUNTANT' | 'ADMIN';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const sessionManager = SessionManager.getInstance();

  if (!sessionManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !sessionManager.hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>;
};

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const sessionManager = SessionManager.getInstance();

  if (sessionManager.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

### 6. Security Utilities

**Location:** `src/utils/security.ts`

**Purpose:** Security functions for XSS protection, validation, and CSP.

**Implementation:**

```typescript
// src/utils/security.ts
import DOMPurify from 'isomorphic-dompurify';

export class SecurityUtils {
  // XSS Protection
  static sanitize(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input);
  }

  // CSRF Protection
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Input Validation
  static validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Minimum 8 characters');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    return { valid: errors.length === 0, errors };
  }

  // Content Security Policy
  static setCSP(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' http://localhost:5000",
    ].join('; ');
    document.head.appendChild(meta);
  }
}
```

## Pages to Implement

### Authentication Pages

1. **Login** (`/login`)
   - Email and password form
   - MFA flow integration (if user has MFA enabled, redirect to MFA login page)
   - Handle response: `{ mfaRequired: true, email: string }` when MFA is enabled
   - "Forgot password" link
   - "Register" link

2. **Register** (`/register`)
   - Email, password, firstName, lastName
   - Password strength indicator
   - Terms and conditions checkbox
   - Email verification notice

3. **Forgot Password** (`/forgot-password`)
   - Email input form
   - Success message

4. **Reset Password** (`/reset-password`)
   - Token from URL query
   - New password form
   - Password confirmation

5. **Verify Email** (`/verify-email`)
   - Token input form
   - Success/error messages

6. **Change Password** (`/change-password`) - Protected
   - Current password
   - New password
   - Confirm new password

### MFA Pages

1. **MFA Setup** (`/mfa/setup`) - Protected
   - QR code display
   - Manual entry option
   - Verification code input

2. **MFA Verify** (`/mfa/verify`) - Protected
   - TOTP code input
   - Backup code option

3. **MFA Login** (`/mfa/login`)
   - TOTP code input for login
   - Backup code option

### Dashboard & Profile

1. **Dashboard** (`/`) - Protected
   - User welcome message
   - Quick stats
   - Recent activity

2. **Profile** (`/profile`) - Protected
   - User information display
   - Edit profile form
   - MFA status
   - Change password link

### Admin Pages

1. **Users List** (`/admin/users`) - Admin Only
   - User table with pagination
   - Search and filter
   - Role filter
   - Create/Edit/Delete actions

2. **User Details** (`/admin/users/:id`) - Admin Only
   - User information
   - Edit user form
   - Role management
   - Resend verification email

## API Endpoints Implementation

Core endpoints to be implemented (excluding performance monitoring for now):

### Authentication Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`

### MFA Endpoints
- `POST /api/v1/auth/mfa/setup`
- `POST /api/v1/auth/mfa/verify-setup`
- `POST /api/v1/auth/mfa/verify-login`
- `POST /api/v1/auth/login/complete`
- `POST /api/v1/auth/mfa/disable`
- `POST /api/v1/auth/mfa/backup-codes`
- `GET /api/v1/auth/mfa/status`
- `POST /api/v1/auth/mfa/generate-qr`
- `GET /api/v1/auth/mfa/qr/:secret/:email`

### User Management Endpoints
- `GET /api/v1/users` (with pagination, filters)
- `GET /api/v1/users/:userId`
- `PUT /api/v1/users/:userId`
- `PATCH /api/v1/users/:userId/role`
- `DELETE /api/v1/users/:userId`
- `GET /api/v1/users/stats`
- `POST /api/v1/users/:userId/resend-verification`

## Security Features

### OWASP Top 10 Protection

1. **Injection**
   - Input sanitization on all user inputs
   - Parameterized API calls
   - No direct SQL/command execution

2. **Broken Authentication**
   - Secure token storage
   - Automatic token refresh
   - Session timeout handling
   - Secure logout

3. **Sensitive Data Exposure**
   - HTTPS only in production
   - Secure storage (sessionStorage for tokens)
   - No sensitive data in logs
   - Token encryption

4. **XML External Entities (XXE)**
   - Not applicable (JSON API)

5. **Broken Access Control**
   - Role-based route guards
   - API-level authorization checks
   - Protected routes

6. **Security Misconfiguration**
   - Content Security Policy headers
   - Secure defaults
   - Environment variable validation

7. **Cross-Site Scripting (XSS)**
   - DOMPurify sanitization
   - React's built-in XSS protection
   - Input validation
   - Output encoding

8. **Insecure Deserialization**
   - JSON validation
   - Type checking
   - Schema validation with Zod

9. **Using Components with Known Vulnerabilities**
   - Regular dependency updates
   - Security audits
   - Dependency scanning

10. **Insufficient Logging & Monitoring**
    - Client-side error logging
    - API error tracking
    - User action logging (where appropriate)

### Additional Security Measures

- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: Client-side rate limit awareness
- **Input Validation**: Client and server-side validation
- **Secure Headers**: CSP, X-Frame-Options, etc.
- **Password Security**: Strength validation, no plain text storage
- **Session Management**: Secure session handling, automatic expiry

## Implementation Checklist

### Phase 1: Setup & Core Infrastructure
- [ ] Initialize React + TypeScript project
- [ ] Set up build tool (Vite/Webpack)
- [ ] Configure Tailwind CSS
- [ ] Set up environment variables
- [ ] Create project structure

### Phase 2: Core Components
- [ ] Implement Singleton API Client
- [ ] Implement Singleton Session Manager
- [ ] Implement Token Manager
- [ ] Implement Singleton Router
- [ ] Create Route Guards
- [ ] Set up Security Utilities

### Phase 3: Authentication Pages
- [ ] Login page
- [ ] Register page
- [ ] Forgot Password page
- [ ] Reset Password page
- [ ] Verify Email page
- [ ] Change Password page

### Phase 4: MFA Implementation
- [ ] MFA Setup page
- [ ] MFA Verify page
- [ ] MFA Login page
- [ ] QR code display
- [ ] Backup codes handling

### Phase 5: Dashboard & Profile
- [ ] Dashboard page
- [ ] Profile page
- [ ] User settings

### Phase 6: Admin Pages
- [ ] Users list page
- [ ] User details page
- [ ] Admin navigation

### Phase 7: Security & Polish
- [ ] Implement all security measures
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add toast notifications
- [ ] Add form validation
- [ ] Add accessibility features
- [ ] Add responsive design

### Phase 8: Testing & Documentation
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Documentation
- [ ] Deployment guide

## Environment Variables

```env
# .env.example
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Authentication Template
VITE_ENVIRONMENT=development
```

## Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "zustand": "^4.4.0"
}
```

### Form & Validation
```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### Security
```json
{
  "isomorphic-dompurify": "^2.9.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Development
```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```

## Future Enhancements

### Performance Monitoring (To be implemented later)
- Performance metrics dashboard
- Endpoint statistics
- System performance summary
- Performance monitoring routes

### SSE (Server-Sent Events) Integration
For the second authentication template version, SSE can be integrated for:
- Real-time session updates
- Live security notifications
- Multi-device session management
- Real-time MFA status updates

### Additional Features
- Dark mode support
- Internationalization (i18n)
- Progressive Web App (PWA)
- Offline support
- Advanced analytics
- Audit logging UI

## Important Implementation Notes

### Login Flow with MFA
When a user with MFA enabled logs in:
1. Login endpoint returns: `{ mfaRequired: true, email: string }` (no tokens)
2. Frontend should redirect to `/mfa/login` page
3. User enters TOTP code or backup code
4. Call `/api/v1/auth/mfa/verify-login` endpoint
5. If successful, call `/api/v1/auth/login/complete` with email
6. Receive tokens and complete login

### Session Management
- Tokens are stored securely with XSS protection
- Automatic token refresh happens 5 minutes before expiry
- Session persists across page refreshes
- Logout invalidates refresh token on backend

### API Response Formats
- **Login/Register**: `{ message, user, tokens: { accessToken, refreshToken } }`
- **Refresh Token**: `{ tokens: { accessToken, refreshToken } }`
- **MFA Setup**: `{ message, secret, userEmail, setupComplete, qrCodeEndpoint }`
- **MFA Verify Setup**: `{ message, backupCodes, setupComplete }`

## Notes

- All singletons ensure single instance pattern for consistency
- Session management is designed to be flexible for future SSE integration
- Security measures follow OWASP Top 10 guidelines
- Code is production-ready with proper error handling
- Architecture supports easy extension and maintenance
- Performance monitoring endpoints excluded for now (to be added later)

