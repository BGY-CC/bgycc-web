import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { PathwayChecklistsClient } from "./_components/pathway-checklists-client";

export const metadata: Metadata = { title: "Pathway Checklists" };

export default function PathwayChecklistsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Pathway Checklists"
        breadcrumb={[{ label: "Pathway Checklists" }]}
      />
      <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <PathwayChecklistsClient />
      </div>
    </div>
  );
}
