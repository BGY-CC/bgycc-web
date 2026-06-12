"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApi, ApiResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface UseQueryOptions<T> {
  enabled?: boolean;
  cacheTtlMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

const QUERY_CACHE_TTL = 30_000;
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

export function useQuery<T = unknown>(endpoint: string, options: UseQueryOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);
  const api = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Use a ref to store callbacks to avoid them being dependencies for fetchData.
  // Synced via effect to satisfy the React Compiler "no refs during render" rule.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchData = useCallback(async (force = false) => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;

    const cached = queryCache.get(endpoint);
    const cacheTtlMs = optionsRef.current.cacheTtlMs ?? QUERY_CACHE_TTL;
    if (!force && cached && Date.now() - cached.timestamp < cacheTtlMs) {
      const cachedData = cached.data as T;
      setData(cachedData);
      setIsLoading(false);
      setError(null);
      if (optionsRef.current.onSuccess) optionsRef.current.onSuccess(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<ApiResponse<T>>(endpoint);
      queryCache.set(endpoint, { data: result.data, timestamp: Date.now() });
      setData(result.data);
      if (optionsRef.current.onSuccess) optionsRef.current.onSuccess(result.data);
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      if (optionsRef.current.onError) optionsRef.current.onError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, api, isAuthenticated]);

  useEffect(() => {
    // We use options.enabled directly as it's a primitive and safe to depend on.
    // Initial fetch on mount / dependency change is the canonical use case for
    // setting state from inside an effect.
    if (options.enabled !== false && !authLoading && isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [endpoint, options.enabled, authLoading, isAuthenticated, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    isLoading: isLoading || authLoading,
    error,
    refetch,
  };
}
