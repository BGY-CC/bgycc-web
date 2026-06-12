"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export interface CustomSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  error?: boolean;
  children?: React.ReactNode;
  placeholder?: string;
}

export const CustomSelect = React.forwardRef<
  HTMLDivElement,
  CustomSelectProps & { children: React.ReactNode }
>(({ className, error, children, placeholder = "Select", disabled, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const internalRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  // Get the current selected value
  const selectedValue = (props.value || "") as string;
  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ value?: string; children?: React.ReactNode; disabled?: boolean }> =>
      React.isValidElement(child),
  );
  const selectedOption = options.find((opt) => opt.props.value === selectedValue);
  const displayText = selectedOption?.props.children || placeholder;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      updateCoords();
      const handleScroll = () => updateCoords();
      const handleResize = () => updateCoords();
      
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [open, updateCoords]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Calculate menu position to stay within viewport
  const getMenuStyle = () => {
    const menuHeight = 320; // max-h-80 approximate
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - coords.top - 8;
    const spaceAbove = coords.top - coords.height - 8;
    const availableWidth = Math.max(0, viewportWidth - 16);
    const width = Math.min(coords.width, availableWidth);
    const left = Math.min(Math.max(8, coords.left), viewportWidth - width - 8);

    const placeAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const maxHeight = Math.max(44, Math.min(menuHeight, placeAbove ? spaceAbove : spaceBelow));
    let top = coords.top + 8;

    if (placeAbove) {
      top = coords.top - coords.height - maxHeight - 8;
    }

    top = Math.max(8, Math.min(top, viewportHeight - maxHeight - 8));

    return {
      position: "fixed" as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${maxHeight}px`,
    };
  };

  const menuStyle = mounted && open ? getMenuStyle() : undefined;

  const dropdown =
    mounted && open
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className={cn(
              "z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-100",
            )}
          >
            {(options as React.ReactElement<{ value: string; children: React.ReactNode; disabled?: boolean }>[]).map((option, i) => {
              const isSelected = selectedValue === option.props.value;
              return (
                <button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                  onClick={() => {
                    const onChange = props.onChange as
                      | ((e: React.ChangeEvent<HTMLSelectElement>) => void)
                      | undefined;
                    if (onChange) {
                      const target = {
                        value: option.props.value,
                        name: props.name,
                      } as unknown as HTMLSelectElement;
                      onChange({
                        target,
                      } as React.ChangeEvent<HTMLSelectElement>);
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "min-h-11 w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                    isSelected && "bg-gray-100 font-semibold text-primary",
                    option.props.disabled && "cursor-not-allowed opacity-50",
                  )}
                  disabled={option.props.disabled}
                >
                  {option.props.children}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={ref || internalRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white",
          "px-3 text-sm text-gray-900",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className,
        )}
      >
        <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
          {displayText}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {dropdown}
    </div>
  );
});

CustomSelect.displayName = "CustomSelect";
