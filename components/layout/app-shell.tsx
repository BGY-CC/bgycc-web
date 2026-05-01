"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui";

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
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-white p-5 md:block">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4">
            <Skeleton className="h-10 w-10 rounded-xl md:hidden" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </header>

          <main className="flex-1 overflow-hidden bg-[#808192]/10 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 rounded-2xl bg-white" />
                ))}
              </div>
            </div>
          </main>
        </div>
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
          
          <div className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 bg-[#808192]/10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
