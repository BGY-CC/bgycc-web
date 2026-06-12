import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 sm:mb-7">
        <h1 className="text-[1.75rem] font-medium leading-tight text-gray-900 sm:text-2xl">
          Let&apos;s get you back on Track
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Login to continue where you left off
        </p>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-50 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
