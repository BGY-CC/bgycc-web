"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Button, Input, FormField, Alert } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (_data: ForgotPasswordInput) => {
    // TODO Phase 2 — call reset email API
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert
          variant="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          We&apos;ve sent a password reset link to your email. It may take a few minutes to arrive.
        </Alert>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="Enter Registered Email"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send Reset Email
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
