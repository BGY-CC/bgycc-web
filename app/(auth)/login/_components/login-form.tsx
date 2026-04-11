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
      {/* Google OAuth */}
      <Button type="button" variant="secondary" className="w-full" size="md">
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-black">Or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

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

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href={ROUTES.LOGIN} className="text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
