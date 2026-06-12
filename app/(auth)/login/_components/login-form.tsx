"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button, Input, FormField, Checkbox, Alert } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setServerError(result.error || "Invalid email or password. Please try again.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <Alert variant="error">{serverError}</Alert>
      )}
      {resetSuccess && (
        <Alert variant="success">Password reset successfully. Please login with your new password.</Alert>
      )}

      {/* Email */}
      <FormField label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="antonyviolin@gmail.com"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
        <div className="mt-1 flex justify-end">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="inline-flex min-h-11 items-center px-1 text-sm font-normal text-primary underline-offset-2 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </FormField>

      {/* Password */}
      <FormField label="Password" required error={errors.password?.message}>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            autoComplete="current-password"
            error={!!errors.password || !!serverError}
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      {/* Remember me */}
      <Checkbox
        id="rememberMe"
        label="Keep me logged in"
        {...register("rememberMe")}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
