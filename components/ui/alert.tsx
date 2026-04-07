import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  success: "bg-success-bg border-success/20 text-success",
  error: "bg-error-bg border-error/20 text-error",
  warning: "bg-warning-bg border-warning/20 text-warning",
  info: "bg-background border-border text-primary",
} as const;

const iconClasses = {
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-primary",
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
