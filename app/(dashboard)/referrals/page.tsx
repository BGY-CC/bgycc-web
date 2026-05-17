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
      
      <div className="flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics / Charts */}
          <div className="lg:col-span-2">
            <ReferralAnalytics />
          </div>

          {/* Weekly Leaderboard */}
          <div className="lg:col-span-1">
            <ReferralLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
