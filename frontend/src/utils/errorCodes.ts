/**
 * Form Validation Error Codes
 * Standardized error codes for form validation
 */

export enum ValidationErrorCode {
  // Email Errors
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  EMAIL_INVALID = 'EMAIL_INVALID',
  EMAIL_INVALID_FORMAT = 'EMAIL_INVALID_FORMAT',
  EMAIL_TOO_LONG = 'EMAIL_TOO_LONG',

  // Password Errors
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  PASSWORD_MISSING_LOWERCASE = 'PASSWORD_MISSING_LOWERCASE',
  PASSWORD_MISSING_UPPERCASE = 'PASSWORD_MISSING_UPPERCASE',
  PASSWORD_MISSING_NUMBER = 'PASSWORD_MISSING_NUMBER',
  PASSWORD_MISSING_SPECIAL = 'PASSWORD_MISSING_SPECIAL',
  PASSWORD_TOO_LONG = 'PASSWORD_TOO_LONG',
  PASSWORD_WEAK = 'PASSWORD_WEAK',
  PASSWORD_DOES_NOT_MATCH = 'PASSWORD_DOES_NOT_MATCH',
  PASSWORD_CONFIRM_REQUIRED = 'PASSWORD_CONFIRM_REQUIRED',
  PASSWORD_SAME_AS_CURRENT = 'PASSWORD_SAME_AS_CURRENT',

  // Name Errors
  NAME_REQUIRED = 'NAME_REQUIRED',
  NAME_TOO_SHORT = 'NAME_TOO_SHORT',
  NAME_TOO_LONG = 'NAME_TOO_LONG',
  NAME_INVALID_CHARACTERS = 'NAME_INVALID_CHARACTERS',
  FIRST_NAME_REQUIRED = 'FIRST_NAME_REQUIRED',
  LAST_NAME_REQUIRED = 'LAST_NAME_REQUIRED',

  // Login Errors
  LOGIN_EMAIL_REQUIRED = 'LOGIN_EMAIL_REQUIRED',
  LOGIN_PASSWORD_REQUIRED = 'LOGIN_PASSWORD_REQUIRED',
  LOGIN_INVALID_CREDENTIALS = 'LOGIN_INVALID_CREDENTIALS',
  LOGIN_ACCOUNT_LOCKED = 'LOGIN_ACCOUNT_LOCKED',
  LOGIN_ACCOUNT_NOT_VERIFIED = 'LOGIN_ACCOUNT_NOT_VERIFIED',

  // Register Errors
  REGISTER_EMAIL_EXISTS = 'REGISTER_EMAIL_EXISTS',
  REGISTER_TERMS_NOT_ACCEPTED = 'REGISTER_TERMS_NOT_ACCEPTED',

  // TOTP Errors
  TOTP_REQUIRED = 'TOTP_REQUIRED',
  TOTP_INVALID_FORMAT = 'TOTP_INVALID_FORMAT',
  TOTP_INVALID = 'TOTP_INVALID',
  TOTP_EXPIRED = 'TOTP_EXPIRED',

  // Backup Code Errors
  BACKUP_CODE_REQUIRED = 'BACKUP_CODE_REQUIRED',
  BACKUP_CODE_INVALID_FORMAT = 'BACKUP_CODE_INVALID_FORMAT',
  BACKUP_CODE_INVALID = 'BACKUP_CODE_INVALID',
  BACKUP_CODE_USED = 'BACKUP_CODE_USED',

  // Token Errors
  TOKEN_REQUIRED = 'TOKEN_REQUIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // General Errors
  FIELD_REQUIRED = 'FIELD_REQUIRED',
  FIELD_INVALID = 'FIELD_INVALID',
  FORM_INVALID = 'FORM_INVALID',
}

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  field?: string;
}

/**
 * Error code to user-friendly message mapping
 */
export const ERROR_MESSAGES: Record<ValidationErrorCode, string> = {
  // Email Errors
  [ValidationErrorCode.EMAIL_REQUIRED]: 'Email address is required',
  [ValidationErrorCode.EMAIL_INVALID]: 'Please enter a valid email address',
  [ValidationErrorCode.EMAIL_INVALID_FORMAT]: 'Email format is invalid. Please check and try again',
  [ValidationErrorCode.EMAIL_TOO_LONG]: 'Email address is too long (maximum 255 characters)',

  // Password Errors
  [ValidationErrorCode.PASSWORD_REQUIRED]: 'Password is required',
  [ValidationErrorCode.PASSWORD_TOO_SHORT]: 'Password must be at least 8 characters long',
  [ValidationErrorCode.PASSWORD_MISSING_LOWERCASE]: 'Password must contain at least one lowercase letter',
  [ValidationErrorCode.PASSWORD_MISSING_UPPERCASE]: 'Password must contain at least one uppercase letter',
  [ValidationErrorCode.PASSWORD_MISSING_NUMBER]: 'Password must contain at least one number',
  [ValidationErrorCode.PASSWORD_MISSING_SPECIAL]: 'Password must contain at least one special character',
  [ValidationErrorCode.PASSWORD_TOO_LONG]: 'Password is too long (maximum 128 characters)',
  [ValidationErrorCode.PASSWORD_WEAK]: 'Password is too weak. Please use a stronger password',
  [ValidationErrorCode.PASSWORD_DOES_NOT_MATCH]: 'Passwords do not match',
  [ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED]: 'Please confirm your password',
  [ValidationErrorCode.PASSWORD_SAME_AS_CURRENT]: 'New password must be different from your current password',

  // Name Errors
  [ValidationErrorCode.NAME_REQUIRED]: 'Name is required',
  [ValidationErrorCode.NAME_TOO_SHORT]: 'Name must be at least 2 characters long',
  [ValidationErrorCode.NAME_TOO_LONG]: 'Name must be less than 50 characters',
  [ValidationErrorCode.NAME_INVALID_CHARACTERS]: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  [ValidationErrorCode.FIRST_NAME_REQUIRED]: 'First name is required',
  [ValidationErrorCode.LAST_NAME_REQUIRED]: 'Last name is required',

  // Login Errors
  [ValidationErrorCode.LOGIN_EMAIL_REQUIRED]: 'Email address is required',
  [ValidationErrorCode.LOGIN_PASSWORD_REQUIRED]: 'Password is required',
  [ValidationErrorCode.LOGIN_INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again',
  [ValidationErrorCode.LOGIN_ACCOUNT_LOCKED]: 'Your account has been locked due to multiple failed login attempts. Please contact support',
  [ValidationErrorCode.LOGIN_ACCOUNT_NOT_VERIFIED]: 'Please verify your email address before logging in',

  // Register Errors
  [ValidationErrorCode.REGISTER_EMAIL_EXISTS]: 'An account with this email already exists. Please use a different email or try logging in',
  [ValidationErrorCode.REGISTER_TERMS_NOT_ACCEPTED]: 'You must accept the Terms and Conditions and Privacy Policy to create an account',

  // TOTP Errors
  [ValidationErrorCode.TOTP_REQUIRED]: 'Verification code is required',
  [ValidationErrorCode.TOTP_INVALID_FORMAT]: 'Verification code must be 6 digits',
  [ValidationErrorCode.TOTP_INVALID]: 'Invalid verification code. Please try again',
  [ValidationErrorCode.TOTP_EXPIRED]: 'Verification code has expired. Please request a new one',

  // Backup Code Errors
  [ValidationErrorCode.BACKUP_CODE_REQUIRED]: 'Backup code is required',
  [ValidationErrorCode.BACKUP_CODE_INVALID_FORMAT]: 'Invalid backup code format',
  [ValidationErrorCode.BACKUP_CODE_INVALID]: 'Invalid backup code. Please check and try again',
  [ValidationErrorCode.BACKUP_CODE_USED]: 'This backup code has already been used',

  // Token Errors
  [ValidationErrorCode.TOKEN_REQUIRED]: 'Token is required',
  [ValidationErrorCode.TOKEN_INVALID]: 'Invalid token. Please check and try again',
  [ValidationErrorCode.TOKEN_EXPIRED]: 'Token has expired. Please request a new one',

  // General Errors
  [ValidationErrorCode.FIELD_REQUIRED]: 'This field is required',
  [ValidationErrorCode.FIELD_INVALID]: 'Invalid value entered',
  [ValidationErrorCode.FORM_INVALID]: 'Please check all fields and try again',
};

/**
 * Get user-friendly error message from error code
 */
export const getErrorMessage = (code: ValidationErrorCode): string => {
  return ERROR_MESSAGES[code] || 'An error occurred. Please try again';
};

/**
 * Get error code from error message (for backward compatibility)
 */
export const getErrorCode = (message: string): ValidationErrorCode | null => {
  const entry = Object.entries(ERROR_MESSAGES).find(([, msg]) => msg === message);
  return entry ? (entry[0] as ValidationErrorCode) : null;
};

