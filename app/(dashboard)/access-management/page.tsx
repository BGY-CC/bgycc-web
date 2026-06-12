import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { AccessManagementClient } from "./_components/access-management-client";

export const metadata: Metadata = { title: "Access Management" };

export default function AccessManagementPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f8fafc]">
      <PageHeader title="Access Management" breadcrumb={[{ label: "Access management" }]} />
      <AccessManagementClient />
    </div>
  );
}
