"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-12 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse bg-primary/10 blur-3xl" />
        <h1 className="relative text-[120px] font-black tracking-tight text-primary/10">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100">
            <Search className="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-2xl font-bold text-gray-900">Page not found</h2>
      <p className="mb-10 max-w-md text-gray-500">
        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          className="h-12 px-6"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
        <Link href="/dashboard">
          <Button className="h-12 px-6" leftIcon={<Home className="h-4 w-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-xs font-medium text-gray-400 uppercase tracking-widest">
        BGYCC School of Leadership
      </div>
    </div>
  );
}
