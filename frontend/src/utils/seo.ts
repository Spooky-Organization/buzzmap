/**
 * SEO Configuration and Utilities
 * Centralized SEO constants and helper functions
 */

import { APP_NAME } from './constants';

// Base URL - from environment variable or fallback
const getBaseUrl = (): string => {
  // Try to get from environment variable (set in production)
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }
  // Fallback to production URL
  return 'https://authtemplate.spookielabsinc.site';
};

export const SEO_CONFIG = {
  // Site Information
  siteName: APP_NAME,
  baseUrl: getBaseUrl(),
  siteDescription: 'Production-ready authentication template with JWT, MFA, RBAC, and comprehensive security features. Built with React, Express, PostgreSQL, and Redis. OWASP compliant and open source.',
  
  // Author/Organization Information
  author: 'Matthew Makundi',
  organization: {
    name: 'SpookieLabsInc',
    url: 'https://www.spookielabsinc.site',
  },
  contactEmail: 'info@spookielabsinc.site',
  linkedIn: 'linkedin.com/in/matthew-makundi',
  github: 'https://github.com/Matthew-kabiu/Dashboard-Template.git',
  
  // Default Images
  defaultOgImage: '/og-image.png',
  
  // Default Keywords
  defaultKeywords: [
    'authentication template',
    'JWT',
    'MFA',
    'two-factor authentication',
    'RBAC',
    'role-based access control',
    'React',
    'Express',
    'PostgreSQL',
    'Redis',
    'TypeScript',
    'Vite',
    'Tailwind CSS',
    'Prisma',
    'Docker',
    'OWASP',
    'open source',
    'security',
    'authentication system',
    'user management',
  ].join(', '),
} as const;

/**
 * Generate canonical URL for a given path
 */
export const getCanonicalUrl = (path: string = ''): string => {
  const baseUrl = SEO_CONFIG.baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Page-specific SEO metadata
 */
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  canonical?: string;
}

/**
 * SEO metadata for each route
 */
export const PAGE_SEO: Record<string, PageSEO> = {
  '/': {
    title: 'Production-Ready Dashboard Template | Secure JWT, MFA, RBAC',
    description: 'Get a complete, secure, production-ready authentication system with JWT, MFA, RBAC, and comprehensive security features. Built with React, Express, PostgreSQL, and Redis. Save weeks of development time.',
    keywords: 'authentication template, JWT, MFA, RBAC, React authentication, Express authentication, open source, production ready',
    ogType: 'website',
  },
  '/login': {
    title: 'Login | Dashboard Template',
    description: 'Sign in to your account. Secure authentication with JWT tokens and optional multi-factor authentication.',
    keywords: 'login, sign in, authentication, JWT, secure login',
    noindex: false,
  },
  '/register': {
    title: 'Create Account | Dashboard Template',
    description: 'Create a new account. Get started with secure authentication and access all features.',
    keywords: 'register, sign up, create account, user registration',
    noindex: false,
  },
  '/forgot-password': {
    title: 'Forgot Password | Dashboard Template',
    description: 'Reset your password. Enter your email address to receive a password reset link.',
    keywords: 'forgot password, password reset, recover account',
    noindex: true, // Don't index password reset pages
  },
  '/reset-password': {
    title: 'Reset Password | Dashboard Template',
    description: 'Reset your password using the token sent to your email.',
    keywords: 'reset password, change password',
    noindex: true,
  },
  '/verify-email': {
    title: 'Verify Email | Dashboard Template',
    description: 'Verify your email address to complete your account registration.',
    keywords: 'email verification, verify email, confirm email',
    noindex: true,
  },
  '/terms': {
    title: 'Terms and Conditions | Dashboard Template',
    description: 'Read our terms and conditions for using the Dashboard Template.',
    keywords: 'terms and conditions, terms of service, legal',
    noindex: false,
  },
  '/privacy': {
    title: 'Privacy Policy | Dashboard Template',
    description: 'Learn how we protect your privacy and handle your data.',
    keywords: 'privacy policy, data protection, privacy',
    noindex: false,
  },
  '/dashboard': {
    title: 'Dashboard | Dashboard Template',
    description: 'Your personal dashboard with account overview and quick access to features.',
    keywords: 'dashboard, user dashboard, account overview',
    noindex: true, // Protected page
  },
  '/profile': {
    title: 'Profile | Dashboard Template',
    description: 'Manage your profile information and account settings.',
    keywords: 'profile, account settings, user profile',
    noindex: true,
  },
  '/change-password': {
    title: 'Change Password | Dashboard Template',
    description: 'Change your account password securely.',
    keywords: 'change password, update password',
    noindex: true,
  },
  '/mfa/setup': {
    title: 'MFA Setup | Dashboard Template',
    description: 'Set up multi-factor authentication for enhanced account security.',
    keywords: 'MFA setup, two-factor authentication, 2FA',
    noindex: true,
  },
  '/mfa/verify': {
    title: 'MFA Verify | Dashboard Template',
    description: 'Verify your multi-factor authentication code.',
    keywords: 'MFA verify, 2FA verify',
    noindex: true,
  },
  '/mfa/login': {
    title: 'MFA Login | Dashboard Template',
    description: 'Complete login with multi-factor authentication.',
    keywords: 'MFA login, 2FA login',
    noindex: true,
  },
  '/admin/users': {
    title: 'User Management | Dashboard Template',
    description: 'Admin user management dashboard.',
    keywords: 'admin, user management',
    noindex: true,
  },
  '/analytics': {
    title: 'Analytics | Dashboard Template',
    description: 'View analytics and performance metrics.',
    keywords: 'analytics, metrics, performance',
    noindex: true,
  },
  '/transactions': {
    title: 'Transactions | Dashboard Template',
    description: 'View your transaction history.',
    keywords: 'transactions, history',
    noindex: true,
  },
  '/reports': {
    title: 'Reports | Dashboard Template',
    description: 'View and generate reports.',
    keywords: 'reports, analytics',
    noindex: true,
  },
};

/**
 * Get SEO metadata for a specific path
 */
export const getPageSEO = (path: string): PageSEO => {
  // Normalize path (remove query params, trailing slashes)
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
  
  // Try exact match first
  if (PAGE_SEO[normalizedPath]) {
    return PAGE_SEO[normalizedPath];
  }
  
  // Try to match dynamic routes (e.g., /admin/users/:id)
  for (const [route, seo] of Object.entries(PAGE_SEO)) {
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      if (regex.test(normalizedPath)) {
        return seo;
      }
    }
  }
  
  // Default SEO for unknown pages
  return {
    title: `${SEO_CONFIG.siteName}`,
    description: SEO_CONFIG.siteDescription,
    keywords: SEO_CONFIG.defaultKeywords,
    noindex: true, // Default to noindex for unknown pages
  };
};

