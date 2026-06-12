"use client";

import { Share2, TrendingUp, Users, Award } from "lucide-react";
import { PageHeader, StatCard, StatCardSkeleton } from "@/components/shared";
import { ReferralLeaderboard } from "./_components/referral-leaderboard";
import { ReferralAnalytics } from "./_components/referral-analytics";
import { useQuery } from "@/hooks/use-query";

interface ReferralStats {
  total_referrals: number;
  monthly_referrals: number;
  weekly_referrals: number;
}

export default function ReferralsPage() {
  // In a real app, we'd have a specific stats endpoint for admin referrals
  // For now, let's assume /referrals/stats or similar
  const { data: stats, isLoading } = useQuery<ReferralStats>("/referrals/stats");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Referral & QR System"
        breadcrumb={[{ label: "Referrals" }]}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))
          ) : (
            <>
              <StatCard
                label="Total Referrals"
                value={stats?.total_referrals?.toString() || "0"}
                icon={<Users className="h-4 w-4" />}
                description="All-time platform growth"
              />
              <StatCard
                label="Monthly Growth"
                value={stats?.monthly_referrals?.toString() || "0"}
                icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                description="New members this month"
              />
              <StatCard
                label="Weekly Growth"
                value={stats?.weekly_referrals?.toString() || "0"}
                icon={<TrendingUp className="h-4 w-4" />}
                description="New members this week"
              />
              <StatCard
                label="Conversion Rate"
                value="68%" 
                icon={<Share2 className="h-4 w-4" />}
                description="Click to install ratio"
              />
              <StatCard
                label="Top Referrer"
                value="24"
                icon={<Award className="h-4 w-4" />}
                description="Most invites this month"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Analytics / Charts */}
          <div className="min-w-0 xl:col-span-2">
            <ReferralAnalytics />
          </div>

          {/* Weekly Leaderboard */}
          <div className="min-w-0">
            <ReferralLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
