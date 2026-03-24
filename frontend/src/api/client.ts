/**
 * Singleton API Client
 * Centralized HTTP client with automatic token management, request/response interceptors, and error handling
 * 
 * IMPORTANT: Always use API_ROUTES from '@/api/apiRoutes' for endpoint definitions
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { TokenManager } from '@/auth/tokenManager';
import { API_ROUTES } from './apiRoutes';
import type { ApiError } from './types';

// Re-export API_ROUTES for convenience
export { API_ROUTES, getSSEUrl, getFullUrl } from './apiRoutes';

/**
 * @deprecated Use API_ROUTES from '@/api/apiRoutes' instead
 * This export is provided for backward compatibility only
 */
export const API_ENDPOINTS = {
  HEALTH: API_ROUTES.HEALTH,
  AUTH: {
    REGISTER: API_ROUTES.AUTH.REGISTER,
    LOGIN: API_ROUTES.AUTH.LOGIN,
    LOGOUT: API_ROUTES.AUTH.LOGOUT,
    REFRESH: API_ROUTES.AUTH.REFRESH,
    VERIFY_EMAIL: API_ROUTES.AUTH.VERIFY_EMAIL,
    FORGOT_PASSWORD: API_ROUTES.AUTH.FORGOT_PASSWORD,
    RESET_PASSWORD: API_ROUTES.AUTH.RESET_PASSWORD,
    CHANGE_PASSWORD: API_ROUTES.AUTH.CHANGE_PASSWORD,
    ME: API_ROUTES.AUTH.ME,
  },
  MFA: {
    SETUP: API_ROUTES.MFA.SETUP,
    VERIFY_SETUP: API_ROUTES.MFA.VERIFY_SETUP,
    VERIFY_LOGIN: API_ROUTES.MFA.VERIFY_LOGIN,
    COMPLETE_LOGIN: API_ROUTES.AUTH.LOGIN_COMPLETE,
    DISABLE: API_ROUTES.MFA.DISABLE,
    STATUS: API_ROUTES.MFA.STATUS,
    GENERATE_QR: API_ROUTES.MFA.GENERATE_QR,
    BACKUP_CODES: API_ROUTES.MFA.BACKUP_CODES,
    QR: API_ROUTES.MFA.QR,
  },
  USERS: {
    LIST: API_ROUTES.USERS.LIST,
    DETAILS: API_ROUTES.USERS.DETAILS,
    UPDATE: API_ROUTES.USERS.UPDATE,
    DELETE: API_ROUTES.USERS.DELETE,
    UPDATE_ROLE: API_ROUTES.USERS.UPDATE_ROLE,
    STATS: API_ROUTES.USERS.STATS,
    RESEND_VERIFICATION: API_ROUTES.USERS.RESEND_VERIFICATION,
  },
  PERFORMANCE: {
    METRICS: API_ROUTES.PERFORMANCE.METRICS,
    STATS: API_ROUTES.PERFORMANCE.STATS,
    ENDPOINTS: API_ROUTES.PERFORMANCE.ENDPOINTS,
    SUMMARY: API_ROUTES.PERFORMANCE.SUMMARY,
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
    
    const baseURL = API_BASE_URL.includes('/api/v1') 
      ? API_BASE_URL.replace('/api/v1', '')
      : API_BASE_URL.replace('/api', '');

    this.client = axios.create({
      baseURL: baseURL || 'http://localhost:5000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getAccessToken(): string | null {
    const session = this.tokenManager.getStoredSession();
    return session?.accessToken || null;
  }

  private setupInterceptors(): void {
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

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
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
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { SessionManager } = await import('@/auth/sessionManager');
            const sessionManager = SessionManager.getInstance();
            const newToken = await sessionManager.refreshToken();
            if (newToken) {
              this.processQueue(null);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
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
    
    if (error && typeof error === 'object' && 'request' in error) {
      return {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      message: errorMessage,
      statusCode: 500,
    };
  }
}

export const apiClient = ApiClient.getInstance();
