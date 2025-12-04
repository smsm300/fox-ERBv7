import { AxiosError } from 'axios';

/**
 * API Error Response Structure
 */
export interface APIError {
  error_code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Standard Error Codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_FAILED = 'AUTH_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  SERVER_ERROR = 'SERVER_ERROR',
  SHIFT_NOT_OPEN = 'SHIFT_NOT_OPEN',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  CREDIT_LIMIT_EXCEEDED = 'CREDIT_LIMIT_EXCEEDED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Error Messages in Arabic
 * Maps error codes to user-friendly Arabic messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'خطأ في البيانات المدخلة',
  AUTH_FAILED: 'فشل في تسجيل الدخول',
  PERMISSION_DENIED: 'ليس لديك صلاحية لهذه العملية',
  NOT_FOUND: 'العنصر غير موجود',
  BUSINESS_RULE_VIOLATION: 'لا يمكن إتمام العملية',
  SERVER_ERROR: 'حدث خطأ في الخادم',
  SHIFT_NOT_OPEN: 'يجب فتح الوردية أولاً',
  INSUFFICIENT_STOCK: 'الكمية غير متوفرة في المخزون',
  CREDIT_LIMIT_EXCEEDED: 'تم تجاوز حد الائتمان',
  DUPLICATE_ENTRY: 'البيانات مكررة',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
};

/**
 * Handle API errors and return user-friendly Arabic message
 * @param error - Axios error object
 * @returns User-friendly error message in Arabic
 */
export function handleAPIError(error: AxiosError<APIError>): string {
  // Network error (no response from server)
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { error_code, message } = error.response.data;

  // Return backend message if available, otherwise use mapped message
  return message || ERROR_MESSAGES[error_code] || ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Get field-specific validation errors
 * @param error - Axios error object
 * @returns Object with field names as keys and error messages as values
 */
export function getValidationErrors(
  error: AxiosError<APIError>
): Record<string, string> | null {
  if (!error.response?.data.details) {
    return null;
  }

  const details = error.response.data.details;
  const fieldErrors: Record<string, string> = {};

  // Convert array of errors to single string per field
  for (const [field, errors] of Object.entries(details)) {
    fieldErrors[field] = Array.isArray(errors) ? errors.join(', ') : String(errors);
  }

  return fieldErrors;
}

/**
 * Check if error is a specific error code
 * @param error - Axios error object
 * @param code - Error code to check
 * @returns True if error matches the code
 */
export function isErrorCode(error: AxiosError<APIError>, code: ErrorCode): boolean {
  return error.response?.data.error_code === code;
}

/**
 * Get error code from error object
 * @param error - Axios error object
 * @returns Error code or null if not available
 */
export function getErrorCode(error: AxiosError<APIError>): string | null {
  return error.response?.data.error_code || null;
}
