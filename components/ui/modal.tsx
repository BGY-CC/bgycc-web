"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ModalContextValue {
  onClose: () => void;
}
const ModalContext = React.createContext<ModalContextValue | null>(null);

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel — clicking the empty area closes the modal */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center px-0 pt-[env(safe-area-inset-top)] sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        {children}
      </div>
    </ModalContext.Provider>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

export interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalContent({ className, children }: ModalContentProps) {
  return (
    <div
      className={cn(
        "relative max-h-[calc(100dvh-env(safe-area-inset-top))] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:max-h-[90dvh] sm:rounded-2xl sm:p-6",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function ModalHeader({
  icon,
  title,
  description,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  const ctx = React.useContext(ModalContext);

  return (
    <div className={cn("mb-5", className)}>
      {/* Close button */}
      {ctx && (
        <button
          onClick={ctx.onClose}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-3 sm:top-3"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center", className)}>
      {children}
    </div>
  );
}
