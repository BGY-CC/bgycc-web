"use client";

import * as React from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  message: string;
  variant?: "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastItem["variant"]) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    (message: string, variant: ToastItem["variant"] = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Single toast ─────────────────────────────────────────────────────────────

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = item.variant !== "error";

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border-l-4",
        "animate-in slide-in-from-bottom-2 fade-in duration-200",
        isSuccess 
          ? "bg-slate-900 text-white border-green-500" 
          : "bg-[#1b2559] text-white border-red-500",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      )}
      <span>{item.message}</span>
      <button
        onClick={() => onDismiss(item.id)}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
