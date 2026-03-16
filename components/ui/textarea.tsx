import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2",
        "text-sm text-gray-900 placeholder:text-gray-400",
        "resize-y transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
