/**
 * Singleton API Client
 * Centralized HTTP client with automatic token management, request/response interceptors, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { TokenManager } from '@/auth/tokenManager';
import type { ApiError } from './types';

// API Endpoints - Centralized definitions
export const API_ENDPOINTS = {
  // Health Check (not versioned)
  HEALTH: '/api/health',

  // Authentication Endpoints
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    ME: '/api/v1/auth/me',
  },

  // Multi-Factor Authentication Endpoints
  MFA: {
    SETUP: '/api/v1/auth/mfa/setup',
    VERIFY_SETUP: '/api/v1/auth/mfa/verify-setup',
    VERIFY_LOGIN: '/api/v1/auth/mfa/verify-login',
    COMPLETE_LOGIN: '/api/v1/auth/login/complete',
    DISABLE: '/api/v1/auth/mfa/disable',
    STATUS: '/api/v1/auth/mfa/status',
    GENERATE_QR: '/api/v1/auth/mfa/generate-qr',
    BACKUP_CODES: '/api/v1/auth/mfa/backup-codes',
    QR: (secret: string, email: string) => `/api/v1/auth/mfa/qr/${encodeURIComponent(secret)}/${encodeURIComponent(email)}`,
  },

  // User Management Endpoints
  USERS: {
    LIST: '/api/v1/users',
    DETAILS: (id: string) => `/api/v1/users/${id}`,
    UPDATE: (id: string) => `/api/v1/users/${id}`,
    DELETE: (id: string) => `/api/v1/users/${id}`,
    UPDATE_ROLE: (id: string) => `/api/v1/users/${id}/role`,
    STATS: '/api/v1/users/stats',
    RESEND_VERIFICATION: (id: string) => `/api/v1/users/${id}/resend-verification`,
  },

  // Performance Monitoring Endpoints (Admin Only)
  PERFORMANCE: {
    METRICS: (endpoint: string) => `/api/v1/admin/performance/${encodeURIComponent(endpoint)}`,
    STATS: (endpoint: string) => `/api/v1/admin/performance/${encodeURIComponent(endpoint)}/stats`,
    ENDPOINTS: '/api/v1/admin/performance/endpoints',
    SUMMARY: '/api/v1/admin/performance/summary',
  },
} as const;

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }> = [];

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
    
    // Extract base URL without /api/v1 since endpoints already include it
    const baseURL = API_BASE_URL.includes('/api/v1') 
      ? API_BASE_URL.replace('/api/v1', '')
      : API_BASE_URL.replace('/api', '');

    this.client = axios.create({
      baseURL: baseURL || 'http://localhost:5000',
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

  /**
   * Get access token from stored session
   */
  private getAccessToken(): string | null {
    const session = this.tokenManager.getStoredSession();
    return session?.accessToken || null;
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
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
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                const token = this.getAccessToken();
                if (token && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Lazy import SessionManager to avoid circular dependency
            const { SessionManager } = await import('@/auth/sessionManager');
            const sessionManager = SessionManager.getInstance();
            const newToken = await sessionManager.refreshToken();
            if (newToken) {
              // Process queued requests
              this.processQueue(null);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            // Lazy import SessionManager to avoid circular dependency
            const { SessionManager } = await import('@/auth/sessionManager');
            SessionManager.getInstance().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    this.failedQueue = [];
  }

  // HTTP Methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  private handleError(error: unknown): ApiError {
    // Check if it's an Axios error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } };
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const data = axiosError.response.data as Record<string, unknown>;
        return {
          message: (data.message as string) || (data.error as string) || 'An error occurred',
          statusCode: axiosError.response.status || 500,
          error: data.error as string | undefined,
          timestamp: data.timestamp as string | undefined,
          path: data.path as string | undefined,
          details: data.details as ApiError['details'],
        };
      }
    }
    
    // Check if it's a network error
    if (error && typeof error === 'object' && 'request' in error) {
      return {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
      };
    }

    // Generic error
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      message: errorMessage,
      statusCode: 500,
    };
  }
}

export const apiClient = ApiClient.getInstance();
