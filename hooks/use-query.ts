"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApi, ApiResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface UseQueryOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useQuery<T = any>(endpoint: string, options: UseQueryOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);
  const api = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Use a ref to store callbacks to avoid them being dependencies for fetchData
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<ApiResponse<T>>(endpoint);
      setData(result.data);
      if (optionsRef.current.onSuccess) optionsRef.current.onSuccess(result.data);
    } catch (err: any) {
      setError(err);
      if (optionsRef.current.onError) optionsRef.current.onError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, api, isAuthenticated]);

  useEffect(() => {
    // We use options.enabled directly as it's a primitive and safe to depend on
    if (options.enabled !== false && !authLoading && isAuthenticated) {
      fetchData();
    }
  }, [endpoint, options.enabled, authLoading, isAuthenticated, fetchData]);

  return { data, isLoading: isLoading || authLoading, error, refetch: fetchData };
}
