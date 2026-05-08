import type { Metadata } from "next";
import { LeadersListClient } from "./_components/leaders-list-client";
import { PageHeader } from "@/components/shared";

export const metadata: Metadata = {
  title: "Leader Management",
  description: "Manage users and their leader status",
};

export default function LeadersPage() {
  return (
    <div className="flex flex-col min-h-full lg:h-full bg-[#F8FAFC]">
      <div className="shrink-0">
        <PageHeader
          title="Leader Management"
          breadcrumb={[{ label: "Leader management" }]}
        />
      </div>

      <div className="flex-1 space-y-6 px-3 py-4 sm:px-4 lg:px-2.5 max-w-[1600px] mx-auto w-full">
        <LeadersListClient />
      </div>
    </div>
  );
}
