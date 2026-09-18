"use client";

import { Share2, TrendingUp, Users } from "lucide-react";
import { PageHeader, StatCard, StatCardSkeleton } from "@/components/shared";
import { ReferralLeaderboard } from "./_components/referral-leaderboard";
import { ReferralAnalytics } from "./_components/referral-analytics";
import { ReferralTopReferrer } from "./_components/referral-top-referrer";
import { useQuery } from "@/hooks/use-query";

interface ReferralStats {
  total_referrals: number;
  monthly_referrals: number;
  weekly_referrals: number;
  link_clicks: number;
  signups: number;
  active_members: number;
  conversion_rate: number;
}

export default function ReferralsPage() {
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
                value={stats?.conversion_rate != null ? `${stats.conversion_rate}%` : "—"}
                icon={<Share2 className="h-4 w-4" />}
                description={`${stats?.link_clicks ?? 0} clicks -> ${stats?.signups ?? 0} signups`}
              />
              <ReferralTopReferrer />
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
