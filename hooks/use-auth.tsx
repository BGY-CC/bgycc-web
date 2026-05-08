"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { API_CONFIG } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("bgycc-auth");
    localStorage.removeItem("bgycc-token");
    localStorage.removeItem("bgycc-refresh-token");
    localStorage.removeItem("bgycc-user");
    router.push(ROUTES.LOGIN);
  }, [router]);

  useEffect(() => {
    // Check if user is logged in from localStorage. Hydrating from a synchronous
    // external store (localStorage) inside an effect is the canonical use case
    // for setting state during an effect.
    const authStatus = localStorage.getItem("bgycc-auth");
    const token = localStorage.getItem("bgycc-token");
    const savedUser = localStorage.getItem("bgycc-user");

    if (authStatus === "true" && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      }
    }
    setIsLoading(false);

    // Listen for unauthorized events from useApi
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      router.push(ROUTES.LOGIN);
    } else if (isAuthenticated) {
      if (isPublicRoute) {
        const target = user?.role === "leader" ? "/clubs" : "/dashboard";
        router.push(target);
      } else if (user?.role === "leader" && !pathname.startsWith("/clubs")) {
        router.push("/clubs");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsAuthenticated(true);
        setUser(result.data.user);
        localStorage.setItem("bgycc-auth", "true");
        localStorage.setItem("bgycc-token", result.data.token);
        localStorage.setItem("bgycc-refresh-token", result.data.refresh_token);
        localStorage.setItem("bgycc-user", JSON.stringify(result.data.user));
        return { success: true };
      }
      return { 
        success: false, 
        error: result.error || result.message || "Invalid email or password. Please try again." 
      };
    } catch (error: unknown) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: "Something went wrong. Please check your connection and try again."
      };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
