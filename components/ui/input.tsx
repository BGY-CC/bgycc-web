import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftAddon, rightAddon, type, ...props }, ref) => {
    if (leftAddon || rightAddon) {
      return (
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
              {leftAddon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              baseInputClasses,
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              error && errorClasses,
              className,
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center text-gray-400">
              {rightAddon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(baseInputClasses, error && errorClasses, className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

// ─── Shared class strings ─────────────────────────────────────────────────────

const baseInputClasses = [
  "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2",
  "text-sm text-gray-900 placeholder:text-gray-400",
  "transition-colors duration-150",
  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
].join(" ");

const errorClasses =
  "border-red-500 focus:ring-red-500 focus:border-red-500";
