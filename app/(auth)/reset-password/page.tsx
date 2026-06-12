import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6 sm:mb-7">
        <h1 className="text-[1.75rem] font-semibold leading-tight text-gray-900 sm:text-2xl">
          Set a new password
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Enter a new password to secure your account.
        </p>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-50 rounded-2xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
