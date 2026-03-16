import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Forgot your password?
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          No worries — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* TODO: <ForgotPasswordForm /> — implemented in auth feature task */}
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        ForgotPasswordForm component — coming next
      </div>
    </>
  );
}
