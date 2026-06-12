"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export function AuthFooter() {
  const pathname = usePathname();

  if (pathname === ROUTES.FORGOT_PASSWORD) {
    return null;
  }

  return (
    <p className="mt-6 w-full max-w-[26rem] px-2 text-center text-[13px] font-normal leading-relaxed text-black sm:mt-8">
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
  );
}
