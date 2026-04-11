import { useMemo, useCallback } from "react";

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
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export function useApi() {
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const request = useCallback(async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("bgycc-token");
          localStorage.removeItem("bgycc-auth");
          window.dispatchEvent(new CustomEvent("unauthorized"));
        }
        throw new Error("Unauthorized");
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || "Something went wrong");
      }

      return result;
    } catch (error: any) {
      if (error.message !== "Unauthorized") {
        console.error(`API Error [${url}]:`, error);
      }
      throw error;
    }
  }, []); // getAuthHeaders doesn't change as it's just a getter

  return useMemo(() => ({
    get: <T = any>(endpoint: string, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: "GET" }),
    
    post: <T = any>(endpoint: string, body: any, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    
    put: <T = any>(endpoint: string, body: any, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    
    patch: <T = any>(endpoint: string, body: any, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
    
    delete: <T = any>(endpoint: string, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: "DELETE" }),
  }), [request]);
}
