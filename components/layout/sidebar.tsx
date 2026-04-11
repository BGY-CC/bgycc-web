"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  PenSquare,
  FolderOpen,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/clubs", icon: Users },
  { label: "Pathway Checklists", href: "/pathway-checklists", icon: ClipboardList },
  { label: "Onboarding Editor", href: "/onboarding-editor", icon: PenSquare },
  { label: "Resources", href: "/resources", icon: FolderOpen },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col",
          "bg-white border-r border-border",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-8 py-8">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="h-px bg-border w-full" />
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto px-4 space-y-2"
          aria-label="Main navigation"
        >
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold",
                  "transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-subtle hover:bg-gray-50 hover:text-primary",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-muted")} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-8">
          <button
            onClick={logout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold text-error hover:bg-error-bg transition-all duration-200"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
