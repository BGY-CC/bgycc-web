import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { ResourcesClient } from "./_components/resources-client";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Resources"
        breadcrumb={[{ label: "Resources" }]}
      />

      <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <ResourcesClient />
      </div>
    </div>
  );
}
