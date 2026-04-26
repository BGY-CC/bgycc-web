"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell is the root layout wrapper for all authenticated dashboard pages.
 *
 * Responsive strategy:
 * - Mobile (<768px):  Sidebar is a drawer (off-canvas). Hamburger in header opens it.
 * - Tablet (≥768px):  Sidebar is a persistent panel, header hamburger hidden.
 * - Desktop (≥1280px): Same as tablet; main content area gains more horizontal space.
 */
export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          
          <div className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 bg-[#808192]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
