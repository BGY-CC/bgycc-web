import type { Metadata } from "next";
import { Users, Activity, TrendingUp } from "lucide-react";
import { PageHeader, StatCard } from "@/components/shared";
import { ClubsListClient } from "./_components/clubs-list-client";

export const metadata: Metadata = { title: "Clubs" };

export default function ClubsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs" }]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Clubs" value="8" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Clubs" value="7" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Total Members" value="1,157" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg Club Score" value="76%" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Interactive list */}
      <ClubsListClient />
    </div>
  );
}
