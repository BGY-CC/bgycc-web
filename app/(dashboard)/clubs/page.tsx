"use client";

import { Users, Activity, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, StatCardSkeleton } from "@/components/shared";
import { ClubsListClient } from "./_components/clubs-list-client";
import { useQuery } from "@/hooks/use-query";
import { ClubStats } from "@/lib/services/clubs";

export default function ClubsPage() {
  const { data: stats, isLoading } = useQuery<ClubStats>("/clubs/stats");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs" }]}
      />
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading && !stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Interactive list */}
      <ClubsListClient />
    </div>
  );
}
