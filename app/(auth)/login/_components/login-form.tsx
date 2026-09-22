"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button, Input, FormField, Checkbox, Alert, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

export function LoginForm() {
  const [tab, setTab] = useState<"password" | "otp">("password");

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as "password" | "otp")}>
        <TabsList className="w-full">
          <TabsTrigger value="password" className="flex-1">
            Password
          </TabsTrigger>
          <TabsTrigger value="otp" className="flex-1">
            One-time code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="password" className="mt-4">
          <PasswordLoginForm />
        </TabsContent>
        <TabsContent value="otp" className="mt-4">
          <OtpLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordLoginForm() {
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

function OtpLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { requestOtp, loginWithOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendCode = async () => {
    setServerError(null);
    if (!email.trim()) {
      setServerError("Please enter your email first.");
      return;
    }
    setIsSending(true);
    const result = await requestOtp(email.trim());
    setIsSending(false);
    if (result.success) {
      setStep("verify");
      setResendCooldown(30);
    } else {
      setServerError(result.error || "Unable to send a sign-in code. Please try again.");
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!code.trim()) {
      setServerError("Please enter the 6-digit code.");
      return;
    }
    setIsVerifying(true);
    const result = await loginWithOtp(email.trim(), code.trim());
    setIsVerifying(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setServerError(result.error || "Invalid or expired code. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError && (
        <Alert variant="error">{serverError}</Alert>
      )}

      {/* Email */}
      <FormField label="Email" required>
        <Input
          type="email"
          aria-label="Email"
          placeholder="antonyviolin@gmail.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>

      {step === "verify" && (
        <FormField label="6-digit code" required>
          <Input
            type="text"
            aria-label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </FormField>
      )}

      {step === "request" ? (
        <Button
          type="button"
          className="w-full"
          onClick={sendCode}
          isLoading={isSending}
        >
          Send code
        </Button>
      ) : (
        <>
          <Button type="submit" className="w-full" isLoading={isVerifying}>
            Sign in
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={sendCode}
            disabled={resendCooldown > 0}
            isLoading={isSending}
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
          </Button>
        </>
      )}
    </form>
  );
}