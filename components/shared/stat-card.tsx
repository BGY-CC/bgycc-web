import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string; // Hex color for icon and subtle background
  change?: number; // e.g. 0, +5.2, -3.1
  changeSuffix?: string; // e.g. "%", " XP"
  className?: string;
}

/**
 * Stat card as seen on the Dashboard and sub-pages.
 * Shows: icon (top-left), change badge (top-right), large value, label.
 */
export function StatCard({ 
  label, 
  value, 
  icon, 
  color,
  change, 
  changeSuffix = "%",
  className 
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;
  const changeLabel = change !== undefined ? `${isPositive ? "+" : ""}${change.toLocaleString()}${changeSuffix}` : "";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div 
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              !color && "bg-background"
            )}
            style={color ? { 
              backgroundColor: `${color}15`,
              color: color 
            } : undefined}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                  className: cn("h-5 w-5", !color && "text-primary", (icon.props as any).className),
                })
              : icon}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold text-primary tracking-tight">{value}</p>
            <p className="mt-1 text-sm font-normal text-muted">{label}</p>
          </div>
        </div>

        {/* Change badge - only show if change is provided */}
        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-success-bg text-success"
                : "bg-error-bg text-error",
            )}
          >
            <TrendingUp className={cn("h-3.5 w-3.5", isPositive ? "" : "rotate-180")} aria-hidden="true" />
            {changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
