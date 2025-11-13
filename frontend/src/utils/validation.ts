/**
 * Singleton Validation Manager
 * Handles all form validation logic with error codes
 */

import { ValidationErrorCode, ValidationError, getErrorMessage } from './errorCodes';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: string[];
  errorCode?: ValidationErrorCode;
  errorCodes?: ValidationErrorCode[];
  fieldErrors?: Record<string, ValidationError>;
}

export interface PasswordValidationResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class ValidationManager {
  private static instance: ValidationManager;

  private constructor() {}

  public static getInstance(): ValidationManager {
    if (!ValidationManager.instance) {
      ValidationManager.instance = new ValidationManager();
    }
    return ValidationManager.instance;
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): ValidationResult {
    if (!email || email.trim() === '') {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.EMAIL_REQUIRED),
        errorCode: ValidationErrorCode.EMAIL_REQUIRED,
      };
    }

    if (email.length > 255) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.EMAIL_TOO_LONG),
        errorCode: ValidationErrorCode.EMAIL_TOO_LONG,
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.EMAIL_INVALID_FORMAT),
        errorCode: ValidationErrorCode.EMAIL_INVALID_FORMAT,
      };
    }

    return { valid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const errorCodes: ValidationErrorCode[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (!password || password.length === 0) {
      return {
        valid: false,
        errors: [getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED)],
        errorCodes: [ValidationErrorCode.PASSWORD_REQUIRED],
        strength: 'weak',
      };
    }

    if (password.length > 128) {
      errors.push(getErrorMessage(ValidationErrorCode.PASSWORD_TOO_LONG));
      errorCodes.push(ValidationErrorCode.PASSWORD_TOO_LONG);
    }

    if (password.length < 8) {
      errors.push(getErrorMessage(ValidationErrorCode.PASSWORD_TOO_SHORT));
      errorCodes.push(ValidationErrorCode.PASSWORD_TOO_SHORT);
    }

    if (!/[a-z]/.test(password)) {
      errors.push(getErrorMessage(ValidationErrorCode.PASSWORD_MISSING_LOWERCASE));
      errorCodes.push(ValidationErrorCode.PASSWORD_MISSING_LOWERCASE);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(getErrorMessage(ValidationErrorCode.PASSWORD_MISSING_UPPERCASE));
      errorCodes.push(ValidationErrorCode.PASSWORD_MISSING_UPPERCASE);
    }

    if (!/[0-9]/.test(password)) {
      errors.push(getErrorMessage(ValidationErrorCode.PASSWORD_MISSING_NUMBER));
      errorCodes.push(ValidationErrorCode.PASSWORD_MISSING_NUMBER);
    }

    // Determine strength
    if (errors.length === 0) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else if (password.length >= 10) {
        strength = 'medium';
      } else {
        strength = 'medium';
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      errorCodes,
      strength,
    };
  }

  /**
   * Validate password match
   */
  validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword || confirmPassword.trim() === '') {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED),
        errorCode: ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED,
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.PASSWORD_DOES_NOT_MATCH),
        errorCode: ValidationErrorCode.PASSWORD_DOES_NOT_MATCH,
      };
    }

    return { valid: true };
  }

  /**
   * Validate name (first name or last name)
   */
  validateName(name: string, fieldName: string = 'Name'): ValidationResult {
    const isFirstName = fieldName.toLowerCase().includes('first');
    const isLastName = fieldName.toLowerCase().includes('last');

    if (!name || name.trim() === '') {
      const errorCode = isFirstName
        ? ValidationErrorCode.FIRST_NAME_REQUIRED
        : isLastName
        ? ValidationErrorCode.LAST_NAME_REQUIRED
        : ValidationErrorCode.NAME_REQUIRED;
      return {
        valid: false,
        error: getErrorMessage(errorCode),
        errorCode,
      };
    }

    if (name.trim().length < 2) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.NAME_TOO_SHORT),
        errorCode: ValidationErrorCode.NAME_TOO_SHORT,
      };
    }

    if (name.trim().length > 50) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.NAME_TOO_LONG),
        errorCode: ValidationErrorCode.NAME_TOO_LONG,
      };
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.NAME_INVALID_CHARACTERS),
        errorCode: ValidationErrorCode.NAME_INVALID_CHARACTERS,
      };
    }

    return { valid: true };
  }

  /**
   * Validate TOTP code (6 digits)
   */
  validateTOTP(code: string): ValidationResult {
    if (!code || code.trim() === '') {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.TOTP_REQUIRED),
        errorCode: ValidationErrorCode.TOTP_REQUIRED,
      };
    }

    const totpRegex = /^\d{6}$/;
    if (!totpRegex.test(code.trim())) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.TOTP_INVALID_FORMAT),
        errorCode: ValidationErrorCode.TOTP_INVALID_FORMAT,
      };
    }

    return { valid: true };
  }

  /**
   * Validate backup code
   */
  validateBackupCode(code: string): ValidationResult {
    if (!code || code.trim() === '') {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.BACKUP_CODE_REQUIRED),
        errorCode: ValidationErrorCode.BACKUP_CODE_REQUIRED,
      };
    }

    // Backup codes are typically 8-10 characters alphanumeric
    const backupCodeRegex = /^[A-Z0-9]{8,10}$/i;
    if (!backupCodeRegex.test(code.trim())) {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.BACKUP_CODE_INVALID_FORMAT),
        errorCode: ValidationErrorCode.BACKUP_CODE_INVALID_FORMAT,
      };
    }

    return { valid: true };
  }

  /**
   * Validate login form
   */
  validateLoginForm(email: string, password: string): ValidationResult {
    const fieldErrors: Record<string, ValidationError> = {};

    const emailResult = this.validateEmail(email);
    if (!emailResult.valid) {
      fieldErrors.email = {
        code: emailResult.errorCode || ValidationErrorCode.LOGIN_EMAIL_REQUIRED,
        message: emailResult.error || getErrorMessage(ValidationErrorCode.LOGIN_EMAIL_REQUIRED),
        field: 'email',
      };
    }

    if (!password || password.trim() === '') {
      fieldErrors.password = {
        code: ValidationErrorCode.LOGIN_PASSWORD_REQUIRED,
        message: getErrorMessage(ValidationErrorCode.LOGIN_PASSWORD_REQUIRED),
        field: 'password',
      };
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        valid: false,
        error: 'Please check your input',
        errorCode: ValidationErrorCode.FORM_INVALID,
        fieldErrors,
      };
    }

    return { valid: true };
  }

  /**
   * Validate register form
   */
  validateRegisterForm(data: RegisterData): ValidationResult {
    const fieldErrors: Record<string, ValidationError> = {};
    const allErrors: string[] = [];
    const allErrorCodes: ValidationErrorCode[] = [];

    // Validate first name
    const firstNameResult = this.validateName(data.firstName, 'First name');
    if (!firstNameResult.valid) {
      fieldErrors.firstName = {
        code: firstNameResult.errorCode || ValidationErrorCode.FIRST_NAME_REQUIRED,
        message: firstNameResult.error || getErrorMessage(ValidationErrorCode.FIRST_NAME_REQUIRED),
        field: 'firstName',
      };
      allErrors.push(firstNameResult.error || '');
      if (firstNameResult.errorCode) allErrorCodes.push(firstNameResult.errorCode);
    }

    // Validate last name
    const lastNameResult = this.validateName(data.lastName, 'Last name');
    if (!lastNameResult.valid) {
      fieldErrors.lastName = {
        code: lastNameResult.errorCode || ValidationErrorCode.LAST_NAME_REQUIRED,
        message: lastNameResult.error || getErrorMessage(ValidationErrorCode.LAST_NAME_REQUIRED),
        field: 'lastName',
      };
      allErrors.push(lastNameResult.error || '');
      if (lastNameResult.errorCode) allErrorCodes.push(lastNameResult.errorCode);
    }

    // Validate email
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.valid) {
      fieldErrors.email = {
        code: emailResult.errorCode || ValidationErrorCode.EMAIL_REQUIRED,
        message: emailResult.error || getErrorMessage(ValidationErrorCode.EMAIL_REQUIRED),
        field: 'email',
      };
      allErrors.push(emailResult.error || '');
      if (emailResult.errorCode) allErrorCodes.push(emailResult.errorCode);
    }

    // Validate password
    const passwordResult = this.validatePassword(data.password);
    if (!passwordResult.valid) {
      fieldErrors.password = {
        code: passwordResult.errorCodes?.[0] || ValidationErrorCode.PASSWORD_REQUIRED,
        message: passwordResult.errors.join(', '),
        field: 'password',
      };
      allErrors.push(...passwordResult.errors);
      if (passwordResult.errorCodes) allErrorCodes.push(...passwordResult.errorCodes);
    }

    // Validate password match
    const passwordMatchResult = this.validatePasswordMatch(data.password, data.confirmPassword);
    if (!passwordMatchResult.valid) {
      fieldErrors.confirmPassword = {
        code: passwordMatchResult.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH,
        message: passwordMatchResult.error || getErrorMessage(ValidationErrorCode.PASSWORD_DOES_NOT_MATCH),
        field: 'confirmPassword',
      };
      allErrors.push(passwordMatchResult.error || '');
      if (passwordMatchResult.errorCode) allErrorCodes.push(passwordMatchResult.errorCode);
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        valid: false,
        error: allErrors.join(', '),
        errors: allErrors,
        errorCode: ValidationErrorCode.FORM_INVALID,
        errorCodes: allErrorCodes,
        fieldErrors,
      };
    }

    return { valid: true };
  }

  /**
   * Validate reset password form
   */
  validateResetPasswordForm(password: string, confirmPassword: string, token?: string): ValidationResult {
    const fieldErrors: Record<string, ValidationError> = {};

    if (token !== undefined && (!token || token.trim() === '')) {
      fieldErrors.token = {
        code: ValidationErrorCode.TOKEN_REQUIRED,
        message: getErrorMessage(ValidationErrorCode.TOKEN_REQUIRED),
        field: 'token',
      };
    }

    const passwordResult = this.validatePassword(password);
    if (!passwordResult.valid) {
      fieldErrors.password = {
        code: passwordResult.errorCodes?.[0] || ValidationErrorCode.PASSWORD_REQUIRED,
        message: passwordResult.errors.join(', '),
        field: 'password',
      };
    }

    const passwordMatchResult = this.validatePasswordMatch(password, confirmPassword);
    if (!passwordMatchResult.valid) {
      fieldErrors.confirmPassword = {
        code: passwordMatchResult.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH,
        message: passwordMatchResult.error || getErrorMessage(ValidationErrorCode.PASSWORD_DOES_NOT_MATCH),
        field: 'confirmPassword',
      };
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        valid: false,
        error: 'Please check your input',
        errorCode: ValidationErrorCode.FORM_INVALID,
        fieldErrors,
      };
    }

    return { valid: true };
  }

  /**
   * Validate change password form
   */
  validateChangePasswordForm(currentPassword: string, newPassword: string, confirmPassword: string): ValidationResult {
    const fieldErrors: Record<string, ValidationError> = {};

    if (!currentPassword || currentPassword.trim() === '') {
      fieldErrors.currentPassword = {
        code: ValidationErrorCode.PASSWORD_REQUIRED,
        message: getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED),
        field: 'currentPassword',
      };
    }

    if (currentPassword === newPassword) {
      fieldErrors.newPassword = {
        code: ValidationErrorCode.PASSWORD_SAME_AS_CURRENT,
        message: getErrorMessage(ValidationErrorCode.PASSWORD_SAME_AS_CURRENT),
        field: 'newPassword',
      };
    }

    const passwordResult = this.validatePassword(newPassword);
    if (!passwordResult.valid) {
      fieldErrors.newPassword = {
        code: passwordResult.errorCodes?.[0] || ValidationErrorCode.PASSWORD_REQUIRED,
        message: passwordResult.errors.join(', '),
        field: 'newPassword',
      };
    }

    const passwordMatchResult = this.validatePasswordMatch(newPassword, confirmPassword);
    if (!passwordMatchResult.valid) {
      fieldErrors.confirmPassword = {
        code: passwordMatchResult.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH,
        message: passwordMatchResult.error || getErrorMessage(ValidationErrorCode.PASSWORD_DOES_NOT_MATCH),
        field: 'confirmPassword',
      };
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        valid: false,
        error: 'Please check your input',
        errorCode: ValidationErrorCode.FORM_INVALID,
        fieldErrors,
      };
    }

    return { valid: true };
  }

  /**
   * Validate email verification form
   */
  validateEmailVerificationForm(token: string): ValidationResult {
    if (!token || token.trim() === '') {
      return {
        valid: false,
        error: getErrorMessage(ValidationErrorCode.TOKEN_REQUIRED),
        errorCode: ValidationErrorCode.TOKEN_REQUIRED,
      };
    }

    return { valid: true };
  }

  /**
   * Validate forgot password form
   */
  validateForgotPasswordForm(email: string): ValidationResult {
    return this.validateEmail(email);
  }
}

export const validationManager = ValidationManager.getInstance();
export default ValidationManager;

