"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        router.push("/dashboard");
      } else {
        setServerError("Invalid email or password. Please try again.");
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

      {/* Email */}
      <FormField label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="antonyviolin@gmail.com"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
        <div className="flex justify-end mt-2">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-normal text-primary hover:underline underline-offset-2"
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
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
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
