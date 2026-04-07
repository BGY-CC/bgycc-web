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
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-[#ffffff] px-4 py-12 sm:py-20">
      {/* Brand mark */}
      <div className="mb-8 text-center sm:mb-10">
        <Logo size="lg" className="flex-row items-center gap-4" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-[448px] rounded-3xl border border-border bg-white p-8 sm:p-10 shadow-none">
        {children}
      </div>

      {/* Legal footer */}
      <p className="mt-8 sm:mt-10 text-center text-[13px] font-medium text-black max-w-sm leading-relaxed">
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
