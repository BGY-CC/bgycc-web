import type { Metadata } from "next";
import { Logo } from "@/components/shared";
import { AuthFooter } from "./_components/auth-footer";

export const metadata: Metadata = {
  title: {
    template: "%s | BGYCC Admin",
    default: "BGYCC Admin",
  },
};

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
      <div className="w-full max-w-[512px] rounded-3xl border border-border bg-white p-10 shadow-none">
        {children}
      </div>

      <AuthFooter />
    </div>
  );
}
