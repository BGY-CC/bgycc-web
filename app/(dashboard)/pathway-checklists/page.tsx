import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { PathwayChecklistsClient } from "./_components/pathway-checklists-client";

export const metadata: Metadata = { title: "Pathway Checklists" };

export default function PathwayChecklistsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pathway Checklists"
        breadcrumb={[{ label: "Pathway Checklists" }]}
      />
      <PathwayChecklistsClient />
    </div>
  );
}
