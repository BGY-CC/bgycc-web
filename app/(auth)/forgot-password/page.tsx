import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-primary sm:text-2xl">
          Forgot your password?
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">
          No worries — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}
