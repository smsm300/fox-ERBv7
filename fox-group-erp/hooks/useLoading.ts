import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Custom hook for managing loading states
 */
export const useLoading = (initialLoading = false): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await promise;
      stopLoading();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ غير متوقع';
      setError(errorMessage);
      stopLoading();
      throw err;
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    withLoading
  };
};
