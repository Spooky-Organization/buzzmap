/**
 * Singleton Session Manager
 * Centralized session management with automatic token refresh, secure storage, and user state management
 */

import { apiClient, API_ENDPOINTS } from '@/api/client';
import { TokenManager } from './tokenManager';
import type {
  User,
  SessionData,
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  ApiError,
} from '@/api/types';

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

  /**
   * Login user
   */
  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Check if MFA is required
      if (response.mfaRequired) {
        return response; // Return without storing session
      }

      // Store session if login is complete
      this.sessionData = {
        user: response.user,
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: this.getTokenExpiry(response.tokens.accessToken),
      };

      this.tokenManager.storeSession(this.sessionData);
      this.scheduleTokenRefresh();

      return response;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  public async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

      // Store session
      this.sessionData = {
        user: response.user,
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: this.getTokenExpiry(response.tokens.accessToken),
      };

      this.tokenManager.storeSession(this.sessionData);
      this.scheduleTokenRefresh();

      return response;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<string | null> {
    if (!this.sessionData?.refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
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

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    if (this.sessionData?.refreshToken) {
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refreshToken: this.sessionData.refreshToken,
        });
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with local logout even if API call fails
      }
    }

    this.clearSession();
  }

  /**
   * Set session from tokens (used for MFA login completion)
   */
  public setSessionFromTokens(user: User, accessToken: string, refreshToken: string): void {
    this.sessionData = {
      user,
      accessToken,
      refreshToken,
      expiresAt: this.getTokenExpiry(accessToken),
    };

    this.tokenManager.storeSession(this.sessionData);
    this.scheduleTokenRefresh();
  }

  /**
   * Get current user
   */
  public async getCurrentUser(): Promise<User | null> {
    // Return cached user if available
    if (this.sessionData?.user) {
      return this.sessionData.user;
    }

    // Try to fetch from API
    try {
      const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
      if (response.user && this.sessionData) {
        this.sessionData.user = response.user;
        this.tokenManager.storeSession(this.sessionData);
      }
      return response.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    return this.sessionData?.accessToken || null;
  }

  /**
   * Get user from session
   */
  public getUser(): User | null {
    return this.sessionData?.user || null;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.sessionData && this.isTokenValid();
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: 'USER' | 'ACCOUNTANT' | 'ADMIN'): boolean {
    return this.sessionData?.user.role === role;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Check if user is accountant
   */
  public isAccountant(): boolean {
    return this.hasRole('ACCOUNTANT');
  }

  /**
   * Check if token is valid (not expired)
   */
  private isTokenValid(): boolean {
    if (!this.sessionData) return false;
    return Date.now() < this.sessionData.expiresAt;
  }

  /**
   * Get token expiry timestamp
   */
  private getTokenExpiry(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.exp || 0) * 1000;
    } catch {
      return Date.now() + 15 * 60 * 1000; // Default 15 minutes
    }
  }

  /**
   * Schedule automatic token refresh
   */
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

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.sessionData = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.tokenManager.clearSession();
  }

  /**
   * Handle API errors
   * Preserves ApiError structure from apiClient to maintain statusCode and details
   */
  private handleError(error: unknown): Error | ApiError {
    // If it's already an ApiError (from apiClient), return it as-is
    // This preserves statusCode, details, and other ApiError properties
    if (error && typeof error === 'object' && 'statusCode' in error && 'message' in error) {
      return error as ApiError;
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(String(error.message));
    }
    
    return new Error('An error occurred');
  }
}

export { SessionManager };
export type { User, SessionData };
