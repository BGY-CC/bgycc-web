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
      <div className="flex flex-col items-center text-center space-y-6 pt-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-bg text-success shadow-sm ring-1 ring-border/10">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary tracking-tight">Check your email</h2>
          <p className="text-sm font-medium text-gray-100 leading-relaxed">
            We&apos;ve sent a password reset link to your email. It may take a few minutes to arrive.
          </p>
        </div>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-white px-6 text-sm text-primary hover:bg-background transition-all shadow-sm active:scale-95 underline underline-offset-4"
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
        <Link href={ROUTES.LOGIN} className="text-primary font-light underline underline-offset-3">
          Back to login
        </Link>
      </p>
    </form>
  );
}
