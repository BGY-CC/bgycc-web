import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { ModerationClient } from "./_components/moderation-client";

export const metadata: Metadata = { title: "Moderation" };

export default function ModerationPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Moderation" breadcrumb={[{ label: "Moderation" }]} />

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <ModerationClient />
      </div>
    </div>
  );
}
