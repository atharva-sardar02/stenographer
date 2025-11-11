/**
 * Validation utilities for forms and user input
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 * Requirements:
 * - At least 6 characters (Firebase minimum)
 * - Recommended: 8+ characters with mix of letters and numbers
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long',
    };
  }

  // Optional: stronger password recommendations
  if (password.length < 8) {
    // Warning but still valid (Firebase minimum is 6)
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Validate display name
 */
export function validateDisplayName(displayName: string): ValidationResult {
  if (!displayName || displayName.trim() === '') {
    return { isValid: false, error: 'Display name is required' };
  }

  if (displayName.trim().length < 2) {
    return {
      isValid: false,
      error: 'Display name must be at least 2 characters',
    };
  }

  if (displayName.trim().length > 50) {
    return {
      isValid: false,
      error: 'Display name must be less than 50 characters',
    };
  }

  return { isValid: true };
}

/**
 * Validate role selection
 */
export function validateRole(role: string): ValidationResult {
  if (!role || (role !== 'attorney' && role !== 'paralegal')) {
    return {
      isValid: false,
      error: 'Please select a valid role (Attorney or Paralegal)',
    };
  }

  return { isValid: true };
}

/**
 * Validate form data for signup
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: 'attorney' | 'paralegal';
}

export function validateSignupForm(data: SignupFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof SignupFormData, string>>;
} {
  const errors: Partial<Record<keyof SignupFormData, string>> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  const displayNameResult = validateDisplayName(data.displayName);
  if (!displayNameResult.isValid) {
    errors.displayName = displayNameResult.error;
  }

  const roleResult = validateRole(data.role);
  if (!roleResult.isValid) {
    errors.role = roleResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate form data for login
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export function validateLoginForm(data: LoginFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof LoginFormData, string>>;
} {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * File validation utilities
 */

export type AllowedFileType = 'pdf' | 'docx' | 'txt';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: AllowedFileType;
}

/**
 * Validate file type
 */
export function validateFileType(file: File): FileValidationResult {
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: PDF, DOCX, TXT`,
    };
  }

  // Map extension to our type
  let fileType: AllowedFileType;
  if (fileExtension === '.pdf') fileType = 'pdf';
  else if (fileExtension === '.docx') fileType = 'docx';
  else fileType = 'txt';

  return { isValid: true, fileType };
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: File): FileValidationResult {
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file (type and size)
 */
export function validateFile(file: File): FileValidationResult {
  const typeResult = validateFileType(file);
  if (!typeResult.isValid) {
    return typeResult;
  }

  const sizeResult = validateFileSize(file);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  return { isValid: true, fileType: typeResult.fileType };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
