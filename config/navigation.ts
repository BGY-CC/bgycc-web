import type { NavItem } from "@/types";

/**
 * Primary sidebar navigation.
 * Icons are resolved at component level via lucide-react to keep this file
 * free of React imports and safe to import in Server Components.
 */
export const primaryNav: Omit<NavItem, "icon">[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
];
