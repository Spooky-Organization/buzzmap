/**
 * Session Check Utility
 * Convenience functions that use SessionManager
 */

import { SessionManager } from '@/auth/sessionManager';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return SessionManager.getInstance().isAuthenticated();
};

/**
 * Get current user from session
 */
export const getCurrentUser = () => {
  return SessionManager.getInstance().getUser();
};

/**
 * Clear session
 */
export const clearSession = async (): Promise<void> => {
  await SessionManager.getInstance().logout();
};

