import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/**
 * FormField composes Label + input slot + error message into a single unit.
 * Keeps form code clean — no repeated label/error boilerplate per field.
 */
export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
