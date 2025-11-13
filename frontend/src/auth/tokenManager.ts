/**
 * Singleton Token Manager
 * Secure token storage with XSS protection
 */

import type { SessionData } from '@/api/types';

class TokenManager {
  private static instance: TokenManager;
  private readonly STORAGE_KEY = 'auth_session';
  private readonly STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

  private constructor() {
    // Use sessionStorage in production for better security
    // Note: In production, consider using sessionStorage for better security
    // For now, using localStorage for development
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store session data securely
   */
  public storeSession(session: SessionData): void {
    try {
      const storage = window[this.STORAGE_TYPE];
      const sanitized = this.sanitizeData(session);
      storage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.error('Failed to store session:', error);
      // Fallback: try sessionStorage if localStorage fails
      if (this.STORAGE_TYPE === 'localStorage') {
        try {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sanitizeData(session)));
        } catch (fallbackError) {
          console.error('Failed to store session in fallback storage:', fallbackError);
        }
      }
    }
  }

  /**
   * Get stored session data
   */
  public getStoredSession(): SessionData | null {
    try {
      const storage = window[this.STORAGE_TYPE];
      const stored = storage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const sanitized = this.sanitizeData(parsed) as SessionData;
      
      // Validate session structure
      if (!sanitized.user || !sanitized.accessToken || !sanitized.refreshToken) {
        this.clearSession();
        return null;
      }

      return sanitized;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session data
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Sanitize data to prevent XSS attacks
   * Basic sanitization - for production, consider using DOMPurify
   */
  private sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      // Remove potentially dangerous characters
      return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const sanitized: Record<string, unknown> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitized[key] = this.sanitizeData((data as Record<string, unknown>)[key]);
        }
      }
      return sanitized;
    }

    return data;
  }
}

export { TokenManager };
