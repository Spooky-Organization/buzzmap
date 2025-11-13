export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Authentication Template';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  CHANGE_PASSWORD: '/change-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  MFA_SETUP: '/mfa/setup',
  MFA_VERIFY: '/mfa/verify',
  MFA_LOGIN: '/mfa/login',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: '/admin/users/:id',
  ANALYTICS: '/analytics',
  TRANSACTIONS: '/transactions',
  REPORTS: '/reports',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  NOT_FOUND: '*',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ACCOUNTANT: 'ACCOUNTANT',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

