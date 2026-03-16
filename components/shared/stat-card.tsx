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
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>

        {/* Change badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3 w-3" aria-hidden="true" />
          )}
          {changeLabel}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
