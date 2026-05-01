import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  active: "bg-green-100 text-green-700",
  dormant: "bg-red-100 text-red-600",
  warning: "bg-orange-100 text-orange-600",
  uploaded: "bg-green-100 text-green-700",
  "no-video": "bg-gray-100 text-gray-500",
  default: "bg-gray-100 text-gray-600",
  primary: "bg-primary text-white",
  outline: "border border-gray-300 text-gray-600 bg-white",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClasses;
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
