"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  PenSquare,
  FolderOpen,
  Megaphone,
  LogOut,
  X,
  UserRoundCheck,
  ShieldCheck,
  KeyRound,
  // Share2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/clubs", icon: Users },
  { label: "Pathway Checklists", href: "/pathway-checklists", icon: ClipboardList },
  { label: "Onboarding Editor", href: "/onboarding-editor", icon: PenSquare },
  { label: "Resources", href: "/resources", icon: FolderOpen },
  { label: "Announcement", href: "/announcement", icon: Megaphone },
  { label: "Leader Management", href: "/leaders", icon: UserRoundCheck },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
  { label: "Access Management", href: "/access-management", icon: KeyRound },
  // { label: "Referrals", href: "/referrals", icon: Share2 },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[min(18rem,88vw)] flex-col",
          "bg-white border-r border-border",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 sm:py-8">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="h-px bg-border w-full" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2">
          {navItems
            .filter(({ label }) => {
              if (user?.role === "leader") {
                return label === "Clubs";
              }
              if (user?.role === "technical_admin") {
                if (label === "Dashboard") return user.permissions?.includes("dashboard.view");
                if (label === "Audit Logs") return user.permissions?.includes("audit.view");
                if (label === "Announcement") return user.permissions?.includes("notifications.view");
                return false;
              }
              if (label === "Access Management") return user?.role === "super_admin";
              return true;
            })
            .map(({ label, href, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-semibold",
                  "transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-subtle hover:bg-gray-50 hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-muted"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:py-8">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-sm font-semibold text-error hover:bg-error-bg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── LOGOUT MODAL ─────────────────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-primary">
              Confirm Logout
            </h2>

            <p className="mt-2 text-sm text-muted">
              Are you sure you want to logout? You will need to sign in again
              to access your dashboard.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                }}
                className="flex-1 rounded-xl bg-error text-white px-4 py-3 text-sm font-semibold hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
