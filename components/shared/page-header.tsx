"use client";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { useSidebar } from "../layout/sidebar-context";
import { useCommandPalette } from "./command-palette-context";

import { useAuth } from "@/hooks/use-auth";

interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

/**
 * Consistent page header: top nav style with search and profile.
 */
export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  const { setIsOpen } = useSidebar();
  const { open: openPalette } = useCommandPalette();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.full_name) {
      const parts = user.full_name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || "AD";
  };

  return (
    <header className="sticky top-0 z-30 mb-4 w-full border-b border-gray-100 bg-white px-3 py-3 sm:mb-6 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="md:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="min-w-0 truncate text-lg font-bold text-[#1e293b] sm:text-xl xl:text-2xl" title={title}>{title}</h1>
        </div>
        
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-3 lg:min-w-0 lg:flex-1">
          <div className="hidden w-full max-w-md lg:block">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open search (Cmd or Ctrl + K)"
              className="group flex h-11 w-full items-center gap-2 rounded-xl bg-[#f1f5f9] px-3 text-left transition-colors hover:bg-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-sm text-gray-400 truncate">Search…</span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-500 shrink-0">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={openPalette}
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            <Link href="/profile" aria-label="Open my profile" className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {user?.profile_picture_url ? (
                <Image
                  src={user.profile_picture_url}
                  alt={user.full_name || "Profile"}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
                  {getInitials()}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mt-2 min-w-0 border-t border-gray-50 pt-2">
          <Breadcrumb items={breadcrumb} />
        </div>
      )}
    </header>
  );
}
