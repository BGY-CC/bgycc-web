"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_CREDENTIALS = {
  email: "antonyviolin@gmail.com",
  password: "password123",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const authStatus = localStorage.getItem("bgycc-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      router.push(ROUTES.LOGIN);
    } else if (isAuthenticated && isPublicRoute) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === DEFAULT_CREDENTIALS.email && password === DEFAULT_CREDENTIALS.password) {
      setIsAuthenticated(true);
      localStorage.setItem("bgycc-auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("bgycc-auth");
    router.push(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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
