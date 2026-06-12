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
    <div className="flex min-h-[100dvh] flex-col items-center justify-start bg-[#ffffff] px-4 py-6 sm:px-6 sm:py-10 lg:justify-center lg:px-8 lg:py-12">
      <div className="mb-5 flex w-full max-w-[512px] justify-center text-center sm:mb-8">
        <div className="sm:hidden">
          <Logo size="md" className="flex-row items-center gap-3" />
        </div>
        <div className="hidden sm:block">
          <Logo size="lg" className="flex-row items-center gap-4" />
        </div>
      </div>

      <div className="w-full max-w-[512px] rounded-3xl border border-border bg-white px-5 py-6 shadow-none sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        {children}
      </div>

      <AuthFooter />
    </div>
  );
}
