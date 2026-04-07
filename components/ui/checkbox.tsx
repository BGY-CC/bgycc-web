"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded border border-gray-300",
              "appearance-none bg-white transition-all duration-150",
              "checked:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          <Check 
            className="pointer-events-none absolute hidden peer-checked:block text-primary h-3 w-3 stroke-[3px]" 
            aria-hidden="true" 
          />
        </div>
        {label && (
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
