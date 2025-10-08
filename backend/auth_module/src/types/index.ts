import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Infer User type from the return type of findUnique
export type User = Awaited<ReturnType<typeof prisma.user.findUnique>>;
// UserRole as a union of possible values
export type UserRole = "ADMIN" | "USER" | "ACCOUNTANT";

// User types
export type UserWithoutPassword = Omit<User, "password">;
export type UserWithoutSensitiveData = Omit<
  User,
  "password" | "refreshToken" | "emailVerificationToken" | "passwordResetToken"
>;

// MFA types
export interface UserWithMFA {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshToken: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaBackupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MFASetupResponse {
  message: string;
  secret: string;
  userEmail: string;
  setupComplete: boolean;
  qrCodeEndpoint: string;
}

export interface MFAVerificationRequest {
  token: string;
}

export interface MFALoginVerificationRequest {
  email: string;
  token?: string;
  backupCode?: string;
}

export interface MFADisableRequest {
  password: string;
}

export interface MFABackupCodesRequest {
  password: string;
}

export interface MFAStatusResponse {
  mfaEnabled: boolean;
  backupCodesRemaining: number;
}

// JWT Payload types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: "access" | "refresh";
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangeRoleRequest {
  role: UserRole;
}

// Response types
export interface AuthResponse {
  user: UserWithoutSensitiveData;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Standardized error response
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: any;
}

// Standardized success response
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  timestamp: string;
}

// Middleware types
export interface AuthenticatedRequest extends Request {
  user?: UserWithoutSensitiveData;
}

// Email types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailVerificationData {
  email: string;
  token: string;
  firstName?: string;
}

export interface PasswordResetData {
  email: string;
  token: string;
  firstName?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
