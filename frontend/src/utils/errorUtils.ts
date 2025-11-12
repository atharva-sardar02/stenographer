/**
 * Error utility functions
 */

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
};

export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('timeout') || error.message.includes('Timeout');
  }
  return false;
};

export const handleApiError = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  return getErrorMessage(error);
};

