import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Variant maps ─────────────────────────────────────────────────────────────

const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:opacity-50 shadow-sm shadow-primary/20",
  secondary:
    "bg-white text-primary border border-border hover:bg-background active:bg-border disabled:opacity-50 shadow-sm",
  ghost:
    "bg-transparent text-muted hover:bg-background hover:text-primary active:bg-border disabled:opacity-50",
  destructive:
    "bg-error text-white hover:bg-error/90 active:bg-error disabled:opacity-50 shadow-sm shadow-error/20",
} as const;

const sizeClasses = {
  sm: "h-9 px-4 text-xs rounded-xl font-medium",
  md: "h-11 px-6 text-sm rounded-2xl font-medium",
  lg: "h-14 px-8 text-base rounded-2xl font-medium",
  icon: "h-11 w-11 rounded-2xl font-medium",
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 font-normal",
          "transition-colors duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "select-none",
          variantClasses[variant],
          sizeClasses[size],
          (disabled || isLoading) && "pointer-events-none",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
