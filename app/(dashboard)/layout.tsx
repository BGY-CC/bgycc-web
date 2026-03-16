import type { Metadata } from "next";
import { AppShell } from "@/components/layout";

export const metadata: Metadata = {
  title: {
    template: "%s | BGYCC Admin",
    default: "Dashboard | BGYCC Admin",
  },
};

/**
 * Dashboard layout — wraps all protected pages with AppShell (sidebar + header).
 * Server Component: AppShell is marked "use client" internally to manage
 * sidebar open state, but the layout itself has no client-side concerns.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
