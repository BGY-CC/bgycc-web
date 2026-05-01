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
      {/* Panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
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
        "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto",
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
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  const ctx = React.useContext(ModalContext);

  return (
    <div className="mb-5">
      {/* Close button */}
      {ctx && (
        <button
          onClick={ctx.onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
    <div className={cn("mt-6 flex items-center gap-3", className)}>
      {children}
    </div>
  );
}
