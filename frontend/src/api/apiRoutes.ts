/**
 * API Routes Configuration
 * Single source of truth for all backend API endpoints
 * Frontend components MUST use these routes instead of hardcoding URLs
 * 
 * Usage:
 *   import { API_ROUTES } from '@/api/apiRoutes';
 *   import { apiClient } from '@/api/client';
 *   
 *   // Instead of:
 *   // await apiClient.get('/api/v1/auth/me');
 *   
 *   // Use:
 *   // await apiClient.get(API_ROUTES.AUTH.ME);
 */

export const API_ROUTES = {
  // Base API URL - use for SSE connections
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  SSE_BASE_URL: import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000',

  // Health Check
  HEALTH: '/api/health',

  // ECDH Key Exchange — plaintext, establishes crypto session
  HANDSHAKE: '/api/handshake',

  // Authentication Routes
  AUTH: {
    // Public routes
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGIN_COMPLETE: '/api/v1/auth/login/complete',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    REFRESH: '/api/v1/auth/refresh',
    
    // Protected routes (require authentication)
    ME: '/api/v1/auth/me',
    LOGOUT: '/api/v1/auth/logout',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },

  // Multi-Factor Authentication Routes
  MFA: {
    // Protected routes (require authentication)
    SETUP: '/api/v1/auth/mfa/setup',
    VERIFY_SETUP: '/api/v1/auth/mfa/verify-setup',
    DISABLE: '/api/v1/auth/mfa/disable',
    STATUS: '/api/v1/auth/mfa/status',
    GENERATE_QR: '/api/v1/auth/mfa/generate-qr',
    BACKUP_CODES: '/api/v1/auth/mfa/backup-codes',
    QR: (secret: string, email: string) => 
      `/api/v1/auth/mfa/qr/${encodeURIComponent(secret)}/${encodeURIComponent(email)}`,
    
    // Public routes
    VERIFY_LOGIN: '/api/v1/auth/mfa/verify-login',
  },

  // User Management Routes
  USERS: {
    // Admin routes
    LIST: '/api/v1/users',
    STATS: '/api/v1/users/stats',
    RESEND_VERIFICATION: (userId: string) => `/api/v1/users/${userId}/resend-verification`,
    
    // User-specific routes (require authentication)
    DETAILS: (userId: string) => `/api/v1/users/${userId}`,
    UPDATE: (userId: string) => `/api/v1/users/${userId}`,
    UPDATE_ROLE: (userId: string) => `/api/v1/users/${userId}/role`,
    DELETE: (userId: string) => `/api/v1/users/${userId}`,
  },

  // SSE (Server-Sent Events) Routes
  SSE: {
    NOTIFICATIONS: '/api/v1/sse/notifications',
    SESSION: '/api/v1/sse/session',
    CONNECTIONS: '/api/v1/sse/connections',
    STATS: '/api/v1/sse/stats',
  },

  // Performance Monitoring Routes (Admin only)
  PERFORMANCE: {
    METRICS: (endpoint: string) => 
      `/api/v1/admin/performance/${encodeURIComponent(endpoint)}`,
    STATS: (endpoint: string) => 
      `/api/v1/admin/performance/${encodeURIComponent(endpoint)}/stats`,
    ENDPOINTS: '/api/v1/admin/performance/endpoints',
    SUMMARY: '/api/v1/admin/performance/summary',
    CLEAR: (endpoint: string) => 
      `/api/v1/admin/performance/${encodeURIComponent(endpoint)}`,
    CLEAR_ALL: '/api/v1/admin/performance',
  },
} as const;

// Type-safe route builders
export type ApiRoutes = typeof API_ROUTES;

/**
 * Helper to get full URL with base
 * Useful for SSE connections that need the full URL
 */
export const getFullUrl = (path: string): string => {
  const base = API_ROUTES.SSE_BASE_URL;
  return `${base}${path}`;
};

/**
 * SSE URL builder with token
 * Generates the full SSE connection URL with auth token
 */
export const getSSEUrl = (
  endpoint: 'NOTIFICATIONS' | 'SESSION',
  token: string
): string => {
  const path = endpoint === 'NOTIFICATIONS' 
    ? API_ROUTES.SSE.NOTIFICATIONS 
    : API_ROUTES.SSE.SESSION;
  const base = API_ROUTES.SSE_BASE_URL;
  return `${base}${path}?token=${encodeURIComponent(token)}`;
};

/**
 * Route metadata for documentation and validation
 */
export const ROUTE_METADATA = {
  [API_ROUTES.AUTH.REGISTER]: { method: 'POST', auth: false, rateLimit: 'auth' },
  [API_ROUTES.AUTH.LOGIN]: { method: 'POST', auth: false, rateLimit: 'auth' },
  [API_ROUTES.AUTH.LOGIN_COMPLETE]: { method: 'POST', auth: false, rateLimit: 'auth' },
  [API_ROUTES.AUTH.VERIFY_EMAIL]: { method: 'POST', auth: false, rateLimit: 'email' },
  [API_ROUTES.AUTH.FORGOT_PASSWORD]: { method: 'POST', auth: false, rateLimit: 'password' },
  [API_ROUTES.AUTH.RESET_PASSWORD]: { method: 'POST', auth: false, rateLimit: 'password' },
  [API_ROUTES.AUTH.REFRESH]: { method: 'POST', auth: false, rateLimit: 'general' },
  [API_ROUTES.AUTH.ME]: { method: 'GET', auth: true, rateLimit: 'general' },
  [API_ROUTES.AUTH.LOGOUT]: { method: 'POST', auth: true, rateLimit: 'general' },
  [API_ROUTES.AUTH.CHANGE_PASSWORD]: { method: 'POST', auth: true, rateLimit: 'general' },
  [API_ROUTES.MFA.VERIFY_LOGIN]: { method: 'POST', auth: false, rateLimit: 'auth' },
  [API_ROUTES.MFA.SETUP]: { method: 'POST', auth: true, rateLimit: 'auth' },
  [API_ROUTES.MFA.VERIFY_SETUP]: { method: 'POST', auth: true, rateLimit: 'auth' },
  [API_ROUTES.MFA.DISABLE]: { method: 'POST', auth: true, rateLimit: 'general' },
  [API_ROUTES.MFA.STATUS]: { method: 'GET', auth: true, rateLimit: 'general' },
  [API_ROUTES.MFA.GENERATE_QR]: { method: 'POST', auth: true, rateLimit: 'auth' },
  [API_ROUTES.MFA.BACKUP_CODES]: { method: 'POST', auth: true, rateLimit: 'general' },
  [API_ROUTES.USERS.LIST]: { method: 'GET', auth: true, role: 'ADMIN', rateLimit: 'admin' },
  [API_ROUTES.USERS.STATS]: { method: 'GET', auth: true, role: 'ADMIN', rateLimit: 'admin' },
} as const;
