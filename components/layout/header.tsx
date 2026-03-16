"use client";

import { Menu, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      {title && (
        <h1 className="text-base font-semibold text-gray-900 hidden sm:block">
          {title}
        </h1>
      )}

      {/* Right-side actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>

        {/* User menu — placeholder */}
        <button
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
          aria-label="Open user menu"
        >
          <div className="h-8 w-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center select-none">
            A
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
