"use client";

import { useQuery } from "@/hooks/use-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
}

export function ReferralLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardItem[]>("/referrals/leaderboard");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500 animate-bounce" />;
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
      <CardHeader className="pb-2 border-b border-gray-50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Referrers
          <Badge variant="secondary" className="ml-auto font-normal text-[10px]">
            THIS MONTH
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
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
                  "p-4 flex items-center gap-4 transition-colors hover:bg-gray-50/50",
                  item.rank === 1 && "bg-yellow-50/30"
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(item.rank)}
                </div>
                
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={item.profile_picture_url || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {item.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-900">
                    {item.full_name}
                  </p>
                  <p className="text-xs text-subtle truncate">
                    @{item.username}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {item.referral_count}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Invites
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground italic">
                No referrals logged yet this month.
              </p>
            </div>
          )}
        </div>

        {leaderboard && leaderboard.length > 0 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-50">
            <button className="text-xs font-semibold text-primary hover:underline w-full text-center">
              View Full Leaderboard
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
