"use client";

import { Award } from "lucide-react";
import { StatCard } from "@/components/shared";
import { useQuery } from "@/hooks/use-query";

interface LeaderboardItem {
  referrer_id: string;
  full_name: string | null;
  username: string;
  referral_count: number;
  rank: number;
}

export function ReferralTopReferrer() {
  const { data } = useQuery<LeaderboardItem[]>(
    "/referrals/leaderboard?timeframe=monthly&page=1&page_size=1"
  );
  const top = data?.[0];
  return (
    <StatCard
      label="Top Referrer"
      value={top?.full_name ?? "—"}
      icon={<Award className="h-4 w-4" />}
      description={top ? `${top.referral_count} invites this month` : "Most invites this month"}
    />
  );
}