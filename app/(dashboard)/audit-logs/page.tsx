import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { AuditLogsClient } from "./_components/audit-logs-client";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Review administrative actions across the BGYCC platform",
};

export default function AuditLogsPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f8fafc]">
      <PageHeader title="Audit Logs" breadcrumb={[{ label: "Audit logs" }]} />
      <AuditLogsClient />
    </div>
  );
}
