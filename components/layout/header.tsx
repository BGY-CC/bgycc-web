"use client";

import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-transparent px-3 sm:px-4 md:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side container - floating style */}
      <div className="flex items-center gap-2 sm:gap-4 bg-white rounded-3xl px-2 sm:px-4 py-2 shadow-sm border border-border min-w-0 flex-1 sm:flex-none">
        {/* Global search */}
        <div className="relative flex-1 sm:w-40 md:w-48 lg:w-64 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search..."
            className="h-10 w-full rounded-2xl bg-background border-none pl-10 pr-3 text-sm text-primary placeholder:text-muted focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-muted hover:text-primary hover:bg-background rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-error border-2 border-white" aria-hidden="true" />
          </Button>

          {/* User avatar */}
          <button
            className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm focus:ring-2 focus:ring-primary/20 shrink-0"
            aria-label="Open user menu"
          >
            <div className="h-full w-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
              JD
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
