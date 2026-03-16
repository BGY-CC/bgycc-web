import type { Metadata } from "next";
import { FileText, Link2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/shared";
import { ResourcesClient } from "./_components/resources-client";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        breadcrumb={[{ label: "Resources" }]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Resources" value="7" icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Drive Links" value="7" icon={<Link2 className="h-4 w-4" />} />
      </div>

      <ResourcesClient />
    </div>
  );
}
