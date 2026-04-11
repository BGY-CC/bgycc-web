import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation. Home icon → slash → items.
 * Last item is always the current page (no link, visually distinct).
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center gap-0.5 text-xs text-gray-500", className)}
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-900 transition-colors"
        aria-label="Dashboard home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-0.5">
            <span className="text-gray-400 mx-0.5">/</span>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-gray-700 font-medium" : ""}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
