"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

import { createPortal } from "react-dom";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: DropdownItem[];
  align?: "left" | "right";
}

export function ActionMenu({ items, align = "right" }: ActionMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const updateCoords = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
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

  const dropdown = open ? createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'absolute',
        top: coords.top,
        left: align === 'right' ? 'auto' : coords.left,
        right: align === 'right' ? window.innerWidth - (coords.left + coords.width) : 'auto',
      }}
      className={cn(
        "z-[9999] mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl animate-in fade-in zoom-in-95 duration-100",
      )}
    >
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          onClick={() => {
            item.onClick();
            setOpen(false);
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
            item.variant === "destructive"
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          {item.icon && (
            <span className="h-4 w-4 shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900",
          open && "bg-gray-100 text-gray-900 shadow-sm"
        )}
        aria-label="Open actions menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {dropdown}
    </>
  );
}
