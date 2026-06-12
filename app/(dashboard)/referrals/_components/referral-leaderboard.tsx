"use client";

import { useState } from "react";
import { useQuery } from "@/hooks/use-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardItem {
  referrer_id: string;
  full_name: string;
  username: string;
  profile_picture_url: string | null;
  referral_count: number;
  rank: number;
  xp: number;
}

export function ReferralLeaderboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleTimeframeChange = (newTimeframe: "weekly" | "monthly") => {
    setTimeframe(newTimeframe);
    setPage(1);
  };

  const { data: leaderboard, isLoading } = useQuery<LeaderboardItem[]>(`/referrals/leaderboard?timeframe=${timeframe}&page=${page}&page_size=${pageSize}`);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500 motion-safe:animate-bounce" />;
      case 2:
        return <Trophy className="h-4 w-4 text-slate-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-50 pb-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-5 w-5 text-primary" />
            Top Referrers
          </CardTitle>
          <div className="grid min-h-11 grid-cols-2 gap-1 rounded-md bg-secondary p-0.5 lg:flex lg:w-auto">
            <button
              onClick={() => handleTimeframeChange("weekly")}
              aria-pressed={timeframe === "weekly"}
              className={cn(
                "h-11 rounded-sm px-3 text-[10px] font-medium transition-colors",
                timeframe === "weekly" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              WEEKLY
            </button>
            <button
              onClick={() => handleTimeframeChange("monthly")}
              aria-pressed={timeframe === "monthly"}
              className={cn(
                "h-11 rounded-sm px-3 text-[10px] font-medium transition-colors",
                timeframe === "monthly" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              MONTHLY
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-2 w-16 bg-gray-50 rounded" />
                </div>
                <div className="h-4 w-8 bg-gray-100 rounded" />
              </div>
            ))
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((item) => (
              <div
                key={item.referrer_id}
                className={cn(
                  "grid grid-cols-[auto_1fr] gap-3 p-4 transition-colors hover:bg-gray-50/50 sm:grid-cols-[auto_auto_1fr_auto]",
                  item.rank === 1 && "bg-yellow-50/30"
                )}
              >
                <div className="flex w-8 items-center justify-center self-center sm:self-auto">
                  {getRankIcon(item.rank)}
                </div>

                <Avatar className="h-10 w-10 border-2 border-white shadow-sm sm:self-center">
                  <AvatarImage src={item.profile_picture_url || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {item.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 sm:self-center">
                  <p className="text-sm font-semibold truncate text-gray-900">
                    {item.full_name}
                  </p>
                  <p className="text-xs text-subtle truncate">
                    @{item.username}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-right sm:col-span-1 sm:border-t-0 sm:pt-0">
                  <div>
                    <p className="text-sm font-bold text-emerald-600">
                      {item.xp}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      XP
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {item.referral_count}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Invites
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground italic">
                No referrals logged yet this {timeframe === "weekly" ? "week" : "month"}.
              </p>
            </div>
          )}
        </div>

        {leaderboard && leaderboard.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-50 bg-gray-50/50 p-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-h-11 rounded-md px-3 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
            >
              Previous
            </button>
            <span className="text-center text-xs text-muted-foreground">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={leaderboard.length < pageSize}
              className="min-h-11 rounded-md px-3 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
