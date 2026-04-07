import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Let&apos;s get you back on Track
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Login to continue where you left off
        </p>
      </div>
      <LoginForm />
    </>
  );
}
