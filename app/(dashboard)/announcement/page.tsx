import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { PageHeader, StatCard } from "@/components/shared";
import { AnnouncementsClient } from "./_components/announcements-client";

export const metadata: Metadata = { title: "Announcement" };

export default function AnnouncementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcement"
        breadcrumb={[{ label: "Announcement" }]}
      />

      {/* Info card mimicking the design's top section */}
      <div className="rounded-3xl bg-white border border-border p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary">Announcements</h2>
            <p className="text-sm font-medium text-muted">Create and manage announcements for BGYCC users</p>
          </div>
        </div>
      </div>

      <AnnouncementsClient />
    </div>
  );
}
