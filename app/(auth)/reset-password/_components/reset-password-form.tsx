"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Button, Input, FormField, Alert } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { ROUTES } from "@/lib/constants";

export function ResetPasswordForm() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    
    if (!token) {
      setServerError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    try {
      const result = await authService.resetPassword(data.password, token);
      if (result.success) {
        router.push(`${ROUTES.LOGIN}?reset=success`);
      } else {
        setServerError(result.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {/* New Password */}
      <FormField label="New Password" required error={errors.password?.message}>
        <div className="relative">
          <Input
            type={showNew ? "text" : "password"}
            placeholder="Enter your new password"
            autoComplete="new-password"
            error={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      {/* Confirm Password */}
      <FormField
        label="Confirm Password"
        required
        error={errors.confirmPassword?.message}
      >
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Enter your new password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
