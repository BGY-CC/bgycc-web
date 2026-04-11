"use client";

import { Users, Activity, TrendingUp } from "lucide-react";
import { PageHeader, StatCard } from "@/components/shared";
import { ClubsListClient } from "./_components/clubs-list-client";
import { useQuery } from "@/hooks/use-query";
import { ClubStats } from "@/lib/services/clubs";

export default function ClubsPage() {
  const { data: stats, isLoading } = useQuery<ClubStats>("/clubs/stats");

  if (isLoading && !stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs" }]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard 
          label="Total Clubs" 
          value={stats?.stats?.total_clubs?.toString() || "0"} 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          label="Active Clubs" 
          value={stats?.stats?.active_clubs?.toString() || "0"} 
          icon={<Activity className="h-4 w-4" />} 
        />
        <StatCard 
          label="Total Members" 
          value={stats?.stats?.total_members?.toLocaleString() || "0"} 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          label="Avg Score" 
          value={stats?.stats?.avg_club_score?.toString() || "0"} 
          icon={<TrendingUp className="h-4 w-4" />} 
        />
      </div>

      {/* Interactive list */}
      <ClubsListClient />
    </div>
  );
}
