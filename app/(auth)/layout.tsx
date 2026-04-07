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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-20">
      {/* Brand mark */}
      <div className="mb-10 text-center">
        <Logo size="lg" className="flex-col items-center gap-4" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-[448px] rounded-3xl border border-border bg-white p-10 shadow-sm">
        {children}
      </div>

      {/* Legal footer */}
      <p className="mt-10 text-center text-[13px] font-medium text-muted max-w-sm leading-relaxed">
        By joining, you agree to our{" "}
        <a href="#" className="text-primary underline underline-offset-4 hover:text-primary-hover">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary underline underline-offset-4 hover:text-primary-hover">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
