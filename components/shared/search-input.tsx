import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn("relative", containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        className={cn(
          "h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3",
          "text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
SearchInput.displayName = "SearchInput";
