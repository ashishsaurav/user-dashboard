/**
 * useQuery Hook
 * React Query-like hook for data fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  cacheTime?: number;
  staleTime?: number;
}

export interface UseQueryResult<T> {
  data: T | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

// Simple cache implementation
const queryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Custom hook for data fetching with caching and refetching
 */
export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    retry = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
  } = options;

  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  
  const [data, setData] = useState<T | undefined>(() => {
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return undefined;
  });
  
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isFetching, setIsFetching] = useState(false);
  
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check if data is still fresh
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const result = await queryFn();
      
      if (!mountedRef.current) return;

      // Cache the result
      queryCache.set(key, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setError(null);
      setIsLoading(false);
      retryCountRef.current = 0;

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(err);
      setIsLoading(false);
      retryCountRef.current = 0;

      if (onError) {
        onError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsFetching(false);
      }
    }
  }, [key, queryFn, enabled, retry, retryDelay, onSuccess, onError, staleTime]);

  // Initial fetch
  useEffect(() => {
    if (enabled && (refetchOnMount || !data)) {
      fetchData();
    }
  }, [enabled, refetchOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    isFetching,
    refetch: fetchData,
  };
}

/**
 * Clear query cache
 */
export function clearQueryCache(queryKey?: string | string[]) {
  if (queryKey) {
    const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    queryCache.delete(key);
  } else {
    queryCache.clear();
  }
}
