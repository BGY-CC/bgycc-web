import type { Metadata } from "next";
import { Logo } from "@/components/shared";

export const metadata: Metadata = {
  title: {
    template: "%s | BGYCC Admin",
    default: "BGYCC Admin",
  },
};

/**
 * Auth layout — centered card, logo above, legal footer below.
 * No sidebar or header chrome; intentionally minimal.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Brand mark */}
      <div className="mb-8">
        <Logo size="md" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-[440px] rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {children}
      </div>

      {/* Legal footer */}
      <p className="mt-8 text-center text-xs text-gray-500 max-w-sm">
        By joining, you agree to our{" "}
        <a href="#" className="underline hover:text-gray-900">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-gray-900">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
