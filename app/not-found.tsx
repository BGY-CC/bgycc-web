"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f8fafc] px-4 py-10 text-center sm:px-6 sm:py-12">
      <div className="w-full max-w-xl">
        <div className="relative mb-6 flex h-40 items-center justify-center sm:mb-8 sm:h-44">
          <div className="absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 animate-pulse rounded-full bg-primary/10 blur-3xl" />
          <h1 className="relative text-[clamp(5.5rem,28vw,7.5rem)] font-black leading-none tracking-[-0.08em] text-primary/10">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:p-4">
              <Search className="h-9 w-9 text-primary sm:h-12 sm:w-12" />
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-[1.75rem] font-bold leading-tight text-gray-900 sm:text-3xl">
          Page not found
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm leading-6 text-gray-500 sm:mb-10 sm:text-base">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="secondary"
            className="h-12 w-full px-6 sm:w-auto"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="h-12 w-full px-6 sm:w-auto" leftIcon={<Home className="h-4 w-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-[11px] font-medium uppercase tracking-[0.28em] text-gray-400 sm:mt-16 sm:text-xs">
          BGYCC School of Leadership
        </div>
      </div>
    </div>
  );
}
