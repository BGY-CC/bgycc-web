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
  "flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2",
  "text-sm text-primary font-normal placeholder:text-muted",
  "transition-all duration-200",
  "focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background",
].join(" ");

const errorClasses =
  "border-error focus:ring-error/10 focus:border-error";
