"use client";

import {
  Users,
  FileText,
  Flame,
  AlertTriangle,
  RefreshCw,
  Mic,
} from "lucide-react";
import { StatCard, PageHeader } from "@/components/shared";
import { EngagementChart, MemberStatusChart } from "@/components/charts";
import { useQuery } from "@/hooks/use-query";
import { DashboardData } from "@/lib/services/dashboard";
import { useState } from "react";

export default function DashboardPage() {
  const [period, setPeriod] = useState("week");
  const { data, isLoading } = useQuery<DashboardData>(
    `/dashboard?period=${period}`,
  );

  const stats = data
    ? [
        {
          label: "Total Active Users",
          value: data.stats.active_users.value.toString(),
          icon: <Users className="h-4 w-4" />,
          change: data.stats.active_users.change_percent || 0,
          trend: data.stats.active_users.trend,
        },
        {
          label: "Avg Daily Reports",
          value: data.stats.avg_daily_reports.value.toFixed(1),
          icon: <FileText className="h-4 w-4" />,
          change: data.stats.avg_daily_reports.change_percent || 0,
          trend: data.stats.avg_daily_reports.trend,
        },
        {
          label: "Avg Streak Length",
          value: `${data.stats.avg_streak_days.value} days`,
          icon: <Flame className="h-4 w-4" />,
          change: data.stats.avg_streak_days.change_percent || 0,
          trend: data.stats.avg_streak_days.trend,
        },
        {
          label: "At-Risk Members",
          value: data.stats.at_risk_members.value.toString(),
          icon: <AlertTriangle className="h-4 w-4" />,
          change: data.stats.at_risk_members.change_percent || 0,
          trend: data.stats.at_risk_members.trend,
        },
        {
          label: "Resets",
          value: data.stats.reset_members.value.toString(),
          icon: <RefreshCw className="h-4 w-4" />,
          change: data.stats.reset_members.change_percent || 0,
          trend: data.stats.reset_members.trend,
        },
        {
          label: "Audio Reports",
          value: data.stats.audio_reports.value.toString(),
          icon: <Mic className="h-4 w-4" />,
          change: data.stats.audio_reports.change_percent || 0,
          trend: data.stats.audio_reports.trend,
        },
      ]
    : [];

  if (isLoading && !data) {
    return (
      <div className="flex h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb={[]} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            change={s.change}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Engagement Trends */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Engagement Trends
              </h2>
              <p className="text-xs text-gray-500">
                Reports & active users this {period}
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <EngagementChart data={data?.engagement_trends} />
        </div>

        {/* Member Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Member Status
              </h2>
              <p className="text-xs text-gray-500">Risk distribution</p>
            </div>
          </div>
          <MemberStatusChart data={data?.member_status} />
        </div>
      </div>
    </div>
  );
}
