import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Login page — renders the sign-in form.
 * Form logic lives in a Client Component to keep this page as a Server Component.
 */
export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Let&apos;s get you back on Track
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Login to continue where you left off
        </p>
      </div>

      {/* TODO: <LoginForm /> — implemented in auth feature task */}
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        LoginForm component — coming next
      </div>
    </>
  );
}
