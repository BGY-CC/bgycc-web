import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
} as const;

const iconClasses = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
} as const;

export interface AlertProps {
  variant?: keyof typeof variantClasses;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  icon,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      )}
    >
      {icon && (
        <span className={cn("mt-0.5 shrink-0", iconClasses[variant])}>
          {icon}
        </span>
      )}
      <div>{children}</div>
    </div>
  );
}
