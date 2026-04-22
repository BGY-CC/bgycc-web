"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            type="radio"
            ref={ref}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded-full border border-gray-300",
              "appearance-none bg-white transition-all duration-150",
              "checked:border-4 checked:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
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

Radio.displayName = "Radio";
