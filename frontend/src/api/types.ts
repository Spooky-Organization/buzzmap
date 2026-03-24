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

export type RegisterResponse = AuthResponse;

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

export type MFALoginCompleteResponse = AuthResponse;

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

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
  timestamp?: string;
}

export enum SSEEventType {
  NOTIFICATION = 'NOTIFICATION',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  SESSION_UPDATED = 'SESSION_UPDATED',
  USER_UPDATED = 'USER_UPDATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  HEARTBEAT = 'HEARTBEAT',
  ERROR = 'ERROR',
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SESSION = 'SESSION',
  SECURITY = 'SECURITY',
}

export interface SessionPayload {
  sessionId: string;
  device?: string;
  ip?: string;
  timestamp: string;
}

export interface UserUpdatePayload {
  userId: string;
  changes: Partial<User>;
}

export interface TokenExpiredPayload {
  expiresAt: string;
}

export interface SSEConnectionInfo {
  connected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: string | null;
}
