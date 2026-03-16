"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabsContextValue {
  active: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs sub-components must be inside <Tabs>");
  return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ active: value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ─── Tab list (pill container) ────────────────────────────────────────────────

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center gap-1 rounded-lg p-1", className)}
    >
      {children}
    </div>
  );
}

// ─── Individual tab ───────────────────────────────────────────────────────────

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { active, onChange } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(value)}
      className={cn(
        "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isActive
          ? "bg-primary text-white shadow-sm"
          : "text-gray-500 hover:text-gray-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── Tab content panel ────────────────────────────────────────────────────────

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
