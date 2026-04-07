import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number; // e.g. 0, +5.2, -3.1
  className?: string;
}

/**
 * Stat card as seen on the Dashboard and sub-pages.
 * Shows: icon (top-left), % change badge (top-right), large value, label.
 */
export function StatCard({ label, value, icon, change = 0, className }: StatCardProps) {
  const isPositive = change >= 0;
  const changeLabel = `${isPositive ? "+" : ""}${change.toFixed(2)}%`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: "h-5 w-5",
              })
            : icon}
        </div>

        {/* Change badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
            isPositive
              ? "bg-success-bg text-success"
              : "bg-error-bg text-error",
          )}
        >
          <TrendingUp className={cn("h-3.5 w-3.5", isPositive ? "" : "rotate-180")} aria-hidden="true" />
          {changeLabel}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-extrabold text-primary tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-bold text-muted">{label}</p>
      </div>
    </div>
  );
}
