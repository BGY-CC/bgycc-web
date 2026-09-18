import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { AnalyticsClient } from "./_components/analytics-client";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Analytics" breadcrumb={[{ label: "Analytics" }]} />

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <AnalyticsClient />
      </div>
    </div>
  );
}
