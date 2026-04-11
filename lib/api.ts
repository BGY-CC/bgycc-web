import { useAuth } from "@/hooks/use-auth";

/**
 * Base configuration for API requests.
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.bgycc.com", // Replace with actual base URL
  TIMEOUT: 10000,
};

/**
 * Custom hook for making authenticated API requests.
 * Uses the auth state from useAuth to include the necessary headers.
 */
export function useApi() {
  const { logout } = useAuth();
  
  // Phase 1: Simple localStorage check
  // Phase 2: This will use actual JWT tokens
  const getAuthHeaders = () => {
    const isAuth = localStorage.getItem("bgycc-auth") === "true";
    return {
      "Content-Type": "application/json",
      ...(isAuth ? { "Authorization": "Bearer mock-token" } : {}),
    };
  };

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${url}]:`, error);
      throw error;
    }
  };

  return {
    get: (endpoint: string, options?: RequestInit) => 
      request(endpoint, { ...options, method: "GET" }),
    
    post: (endpoint: string, body: any, options?: RequestInit) => 
      request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    
    put: (endpoint: string, body: any, options?: RequestInit) => 
      request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    
    patch: (endpoint: string, body: any, options?: RequestInit) => 
      request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
    
    delete: (endpoint: string, options?: RequestInit) => 
      request(endpoint, { ...options, method: "DELETE" }),
  };
}
