"use client";

import { Download, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@/hooks/use-query";
import type { CelebrationItem } from "@/lib/services/ranks";

const getWeekKey = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

export function WeeklyCelebrations() {
  const weekKey = getWeekKey(new Date());
  const { data, isLoading, error, refetch } = useQuery<CelebrationItem[]>(
    `/admin/ranks/celebrations?week=${weekKey}`
  );
  const celebrations = data ?? [];

  const handleExport = () => {
    if (celebrations.length === 0) return;
    const header = "Name,Username,Rank,Promoted At\n";
    const rows = celebrations
      .map(
        (item) =>
          `"${item.memberName ?? ""}","${item.username ?? ""}","${item.rank.symbol} ${item.rank.name}","${item.promotedAt ?? ""}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `celebrations-${weekKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <div className="bg-primary p-6 text-white">
        <h3 className="flex items-center gap-2 text-xl font-black">
          <PartyPopper className="h-5 w-5" />
          Celebrations This Week 🎊
        </h3>
        <p className="mt-1 text-sm text-primary-foreground/80">
          This week&apos;s promotions — share the spotlight
        </p>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-2 w-16 bg-gray-50 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            ))
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">Failed to load celebrations.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : celebrations.length > 0 ? (
            celebrations.map((item) => (
              <div key={item.memberId} className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50/50">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={item.profilePictureUrl || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {(item.memberName || "?").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-gray-900">
                    {item.memberName || "Anonymous"}
                  </p>
                  <p className="text-xs text-subtle truncate">
                    {item.username ? `@${item.username}` : item.promotedAt ?? ""}
                  </p>
                </div>
                <span className="shrink-0">
                  <span className="text-lg" aria-hidden="true">{item.rank.symbol}</span>
                  <span className="ml-1 hidden text-xs font-semibold text-primary sm:inline">
                    {item.rank.name}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground italic">
                No promotions celebrated this week yet.
              </p>
            </div>
          )}
        </div>

        {!isLoading && !error && celebrations.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-50 bg-gray-50/50 p-4">
            <span className="text-xs text-muted-foreground">
              {celebrations.length} promotion{celebrations.length === 1 ? "" : "s"}
            </span>
            <Button variant="outline" size="sm" className="h-11 gap-2 px-4" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}