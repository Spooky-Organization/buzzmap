/**
 * API Response Types
 * Types matching the backend API responses
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ACCOUNTANT' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse extends AuthResponse {}

export interface LoginResponse extends AuthResponse {
  mfaRequired?: boolean;
}

export interface RefreshTokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface MFASetupResponse {
  message: string;
  secret: string;
  userEmail: string;
  setupComplete: boolean;
  qrCodeEndpoint: string;
}

export interface MFAVerifySetupResponse {
  message: string;
  backupCodes: string;
  setupComplete: boolean;
}

export interface MFAVerifyLoginResponse {
  message: string;
  mfaVerified: boolean;
}

export interface MFALoginCompleteResponse extends AuthResponse {}

export interface MFAStatusResponse {
  mfaEnabled: boolean;
  backupCodesRemaining: number;
}

export interface GenerateQRResponse {
  qrCodeDataURL: string;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserStatsResponse {
  stats: {
    total: number;
    verified: number;
    unverified: number;
    byRole: {
      USER: number;
      ACCOUNTANT: number;
      ADMIN: number;
    };
  };
}

export interface ApiError {
  error?: string;
  message: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  details?: {
    field?: string;
    message?: string;
    [key: string]: unknown;
  };
}

export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
