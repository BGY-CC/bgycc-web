"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Globe,
  Link2,
  MousePointer2,
  QrCode,
  Share2,
  UserPlus,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@/hooks/use-query";
import {
  type ReferralStats,
  type ReferralSourceBreakdown,
  type ReferralStatsPeriod,
  ReferralGeoData,
  ReferralLeaderboardItem,
} from "@/lib/services/referrals";

const PERIOD_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
] as const;

const SOURCE_ROWS = [
  { key: "deep_link", label: "Deep Link", color: "bg-blue-500" },
  { key: "qr", label: "QR Scan", color: "bg-indigo-500" },
  { key: "share", label: "Share", color: "bg-emerald-500" },
] as const;

export function ReferralAnalytics() {
  const [period, setPeriod] = useState<ReferralStatsPeriod>("all");
  const periodQuery = period === "all" ? "" : `?period=${period}`;

  const { data: stats } = useQuery<ReferralStats>(`/referrals/stats${periodQuery}`);
  const { data: geo } = useQuery<ReferralGeoData>("/referrals/geo");
  const { data: leaderboard } = useQuery<ReferralLeaderboardItem[]>("/referrals/leaderboard?timeframe=monthly");

  const locations = geo?.locations ?? [];
  const breakdown: ReferralSourceBreakdown = stats?.source_breakdown ?? {
    deep_link: 0,
    qr: 0,
    share: 0,
  };
  const sourceTotal = breakdown.deep_link + breakdown.qr + breakdown.share;

  const handleExport = () => {
    if (!leaderboard || leaderboard.length === 0) return;
    const header = "Name,Username,Referral Count\n";
    const rows = leaderboard
      .map((r) => `"${r.full_name ?? ""}","${r.username ?? ""}",${r.referral_count}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl font-bold text-primary">Conversion Funnel</CardTitle>
            <CardDescription>Measuring the journey from invite to active member</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid min-h-11 grid-cols-3 gap-1 rounded-md bg-secondary p-0.5">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  aria-pressed={period === option.value}
                  className={`h-11 rounded-sm px-3 text-[10px] font-medium transition-colors ${
                    period === option.value
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label.toUpperCase()}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-full gap-2 px-4 sm:w-auto"
              onClick={handleExport}
              disabled={!leaderboard || leaderboard.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2 rounded-3xl border border-blue-100 bg-blue-50/50 p-5 text-center sm:p-6">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                <MousePointer2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-blue-900">{stats?.link_clicks ?? 0}</p>
              <p className="text-sm font-semibold text-blue-700">Link Clicks</p>
              <Badge variant="outline" className="border-blue-200 bg-white/50 text-blue-600">
                Tracked
              </Badge>
            </div>

            <div className="space-y-2 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 text-center sm:p-6">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-indigo-900">{stats?.signups ?? 0}</p>
              <p className="text-sm font-semibold text-indigo-700">Referred Signups</p>
              <Badge variant="outline" className="border-indigo-200 bg-white/50 text-indigo-600">
                {stats?.conversion_rate ?? 0}% conversion
              </Badge>
            </div>

            <div className="space-y-2 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 text-center sm:p-6 sm:col-span-2 xl:col-span-1">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-900">{stats?.active_members ?? 0}</p>
              <p className="text-sm font-semibold text-emerald-700">Active Members</p>
              <Badge variant="outline" className="border-emerald-200 bg-white/50 text-emerald-600">
                {stats?.monthly_referrals ?? 0} this month
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographical Spread */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Geographical Reach</CardTitle>
          </div>
          <CardDescription>Top states and cities driving organic growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {locations.length > 0 ? locations.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-gray-700">{item.label}</span>
                  <span className="text-subtle font-medium">{item.count} referrals</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 italic">No geo data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card className="border-none bg-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4 bg-primary p-6 text-white sm:p-8">
            <h3 className="flex items-center gap-2 text-2xl font-black">
              <QrCode className="h-6 w-6" />
              QR vs Link
            </h3>
            <p className="text-primary-foreground/80 text-sm">
              Where referral link clicks come from — a scanned QR code, a shared link, or a plain
              deep link.
            </p>
          </div>
          <div className="space-y-5 bg-gray-50 p-6 sm:p-8">
            {sourceTotal > 0 ? (
              SOURCE_ROWS.map(({ key, label, color }) => {
                const count = breakdown[key];
                const share = Math.round((count / sourceTotal) * 100);
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-gray-700">
                        {key === "qr" ? (
                          <QrCode className="h-4 w-4 text-indigo-500" />
                        ) : key === "share" ? (
                          <Share2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Link2 className="h-4 w-4 text-blue-500" />
                        )}
                        {label}
                      </span>
                      <span className="text-subtle font-medium">
                        {count} · {share}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200/70">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 italic">
                No source attribution data yet — click tracking records a source the first time
                you share a QR code or link.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}