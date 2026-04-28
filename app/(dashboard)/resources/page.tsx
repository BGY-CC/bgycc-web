import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { ResourcesClient } from "./_components/resources-client";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        breadcrumb={[{ label: "Resources" }]}
      />

      <ResourcesClient />
    </div>
  );
}
