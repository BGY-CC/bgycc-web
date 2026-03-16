import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set New Password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter a new password to secure your account.
        </p>
      </div>

      {/* TODO: <ResetPasswordForm /> — implemented in auth feature task */}
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        ResetPasswordForm component — coming next
      </div>
    </>
  );
}
