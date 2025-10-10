/**
 * useMutation Hook
 * React Query-like hook for mutations (POST, PUT, DELETE)
 */

import { useState, useCallback, useRef } from 'react';
import { clearQueryCache } from './useQuery';

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: any, variables: TVariables) => void;
  invalidateQueries?: string | (string | any)[];
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Custom hook for mutations
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateQueries,
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mountedRef = useRef(true);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        
        if (!mountedRef.current) return result;

        setData(result);
        setError(null);

        // Invalidate queries if specified
        if (invalidateQueries) {
          clearQueryCache(invalidateQueries);
        }

        if (onSuccess) {
          onSuccess(result, variables);
        }

        return result;
      } catch (err) {
        if (!mountedRef.current) throw err;

        setError(err);

        if (onError) {
          onError(err, variables);
        }

        throw err;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);

          if (onSettled) {
            onSettled(data, error, variables);
          }
        }
      }
    },
    [mutationFn, onSuccess, onError, onSettled, invalidateQueries, data, error]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      return mutateAsync(variables).catch((err) => {
        // Error is already handled in mutateAsync
        console.error('Mutation error:', err);
      });
    },
    [mutateAsync]
  );

  return {
    mutate: mutate as any,
    mutateAsync,
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    reset,
  };
}
