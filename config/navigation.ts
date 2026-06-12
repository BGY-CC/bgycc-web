import type { NavItem } from "@/types";

/**
 * Primary sidebar navigation — matches the 5 pages in the designs.
 * Icons are resolved at component level via lucide-react to keep this
 * file free of React imports and safe for Server Component imports.
 */
export const primaryNav: Omit<NavItem, "icon">[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clubs", href: "/clubs" },
  { label: "Pathway Checklists", href: "/pathway-checklists" },
  { label: "Onboarding Editor", href: "/onboarding-editor" },
  { label: "Resources", href: "/resources" },
  { label: "Announcement", href: "/announcement" },
  { label: "Audit Logs", href: "/audit-logs" },
];
