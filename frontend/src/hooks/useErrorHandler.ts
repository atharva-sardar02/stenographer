import { useState, useCallback } from 'react';

export interface ErrorHandler {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: unknown) => void;
  clearError: () => void;
}

export const useErrorHandler = (): ErrorHandler => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
};

