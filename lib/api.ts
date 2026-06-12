import { useMemo, useCallback } from "react";
import { notifyAdminMutation } from "@/lib/audit-events";

/**
 * lib/api.ts
 */

/**
 * Base configuration for API requests.
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin",
  TIMEOUT: 10000,
};

/**
 * Standard API Response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ServiceResult<T = unknown> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  id?: string;
}

export const readJson = <T = ServiceResult>(response: Response): Promise<T> =>
  response.json() as Promise<T>;

// Module-level shared promise to deduplicate concurrent refresh attempts.
const refreshState: { promise: Promise<boolean> | null } = { promise: null };

const refreshAccessToken = (): Promise<boolean> => {
  if (refreshState.promise) return refreshState.promise;

  const promise = (async () => {
    try {
      const refreshToken = localStorage.getItem("bgycc-refresh-token");
      if (!refreshToken) return false;

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const result = await readJson<ServiceResult<{ token: string; refresh_token: string }>>(response);
      if (response.ok && result.success && result.data) {
        localStorage.setItem("bgycc-token", result.data.token);
        localStorage.setItem("bgycc-refresh-token", result.data.refresh_token);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return false;
    } finally {
      refreshState.promise = null;
    }
  })();

  refreshState.promise = promise;
  return promise;
};

export function useApi() {
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const request = useCallback(async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const executeRequest = async () => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      };
      return fetch(url, { ...options, headers });
    };

    try {
      let response = await executeRequest();

      // If unauthorized, try to refresh
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // Retry the request with new token
          response = await executeRequest();
        }
      }

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("bgycc-token");
          localStorage.removeItem("bgycc-refresh-token");
          localStorage.removeItem("bgycc-auth");
          window.dispatchEvent(new CustomEvent("unauthorized"));
        }
        throw new Error("Unauthorized");
      }

      const result = await response.json().catch(() => ({})) as ServiceResult & T;

      if (!response.ok) {
        throw new Error(result.error || result.message || "Something went wrong");
      }

      const method = (options.method || "GET").toUpperCase();
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        notifyAdminMutation(endpoint, method);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message !== "Unauthorized") {
        console.error(`API Error [${url}]:`, error);
      }
      throw error;
    }
  }, []);

  return useMemo(() => ({
    get: <T = unknown>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "GET" }),

    post: <T = unknown>(endpoint: string, body: unknown, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: <T = unknown>(endpoint: string, body: unknown, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

    patch: <T = unknown>(endpoint: string, body: unknown, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

    delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "DELETE" }),
  }), [request]);
}
