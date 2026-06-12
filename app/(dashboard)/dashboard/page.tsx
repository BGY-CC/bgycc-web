"use client";

import {
  Users,
  FileText,
  Flame,
  AlertTriangle,
  RefreshCw,
  Mic,
  ChevronDown,
  Building2,
  ArrowRight,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { StatCard, StatCardSkeleton, PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui";
import { EngagementChart, MemberStatusChart } from "@/components/charts";
import { useQuery } from "@/hooks/use-query";
import { DashboardData } from "@/lib/services/dashboard";
import { useEffect, useRef, useState } from "react";

const PERIOD_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb={[]} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-11 w-full rounded-md sm:w-32" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("week");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery<DashboardData>(
    `/dashboard?period=${period}`,
  );

  useEffect(() => {
    if (!periodOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [periodOpen]);

  const periodLabel =
    PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "This Week";

  const stats = data
    ? [
        {
          label: "Total Active Users",
          value: data.stats.active_users.value.toString(),
          icon: <Users className="h-4 w-4" />,
          change: data.stats.active_users.change_percent || 0,
          trend: data.stats.active_users.trend,
          href: "/leaders",
        },
        {
          label: "Avg Daily Reports",
          value: data.stats.avg_daily_reports.value.toFixed(1),
          icon: <FileText className="h-4 w-4" />,
          change: data.stats.avg_daily_reports.change_percent || 0,
          trend: data.stats.avg_daily_reports.trend,
          href: "/pathway-checklists",
        },
        {
          label: "Avg Streak Length",
          value: `${data.stats.avg_streak_days.value} days`,
          icon: <Flame className="h-4 w-4" />,
          change: data.stats.avg_streak_days.change_percent || 0,
          trend: data.stats.avg_streak_days.trend,
          href: "/leaders",
        },
        {
          label: "At-Risk Members",
          value: data.stats.at_risk_members.value.toString(),
          icon: <AlertTriangle className="h-4 w-4" />,
          change: data.stats.at_risk_members.change_percent || 0,
          trend: data.stats.at_risk_members.trend,
          href: "/leaders",
        },
        {
          label: "Resets",
          value: data.stats.reset_members.value.toString(),
          icon: <RefreshCw className="h-4 w-4" />,
          change: data.stats.reset_members.change_percent || 0,
          trend: data.stats.reset_members.trend,
          href: "/leaders",
        },
        {
          label: "Audio Reports",
          value: data.stats.audio_reports.value.toString(),
          icon: <Mic className="h-4 w-4" />,
          change: data.stats.audio_reports.change_percent || 0,
          trend: data.stats.audio_reports.trend,
          href: "/pathway-checklists",
        },
        {
          label: "Clubs Created",
          value: data.stats.clubs_created.value.toString(),
          icon: <Building2 className="h-4 w-4" />,
          change: data.stats.clubs_created.change_percent || 0,
          trend: data.stats.clubs_created.trend,
          href: "/clubs",
        },
      ]
    : [];

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Dashboard" breadcrumb={[]} />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <StatCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                change={s.change}
                className="h-full cursor-pointer"
              />
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Engagement Trends */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-gray-900">
                  Engagement Trends
                </h2>
                <p className="text-xs text-gray-500">
                  Reports & active users this {period}
                </p>
              </div>
              <div ref={periodRef} className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPeriodOpen((p) => !p)}
                  aria-haspopup="listbox"
                  aria-expanded={periodOpen}
                  className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto sm:min-w-[148px]"
                >
                  {periodLabel}
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                {periodOpen && (
                  <ul
                    role="listbox"
                    className="absolute left-0 top-full z-[100] mt-1 w-full min-w-[148px] rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150 sm:left-auto sm:right-0 sm:w-auto"
                  >
                    {PERIOD_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={period === opt.value}
                          onClick={() => {
                            setPeriod(opt.value);
                            setPeriodOpen(false);
                          }}
                          className={`min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                            period === opt.value
                              ? "text-primary font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <EngagementChart data={data?.engagement_trends} />
          </div>

          {/* Member Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankingCard
            title="Top Performing Clubs"
            href="/clubs"
            emptyLabel="No club ranking data available."
            items={(data?.top_clubs ?? []).map((club) => ({
              id: club.id,
              label: club.name,
              detail: `${club.active_members.toLocaleString()} active members`,
              value: `${club.average_streak} day avg streak`,
              href: `/clubs/${club.id}`,
            }))}
          />
          <RankingCard
            title="Top Performing Leaders"
            href="/leaders"
            emptyLabel="No leader ranking data available."
            items={(data?.top_leaders ?? []).map((leader) => ({
              id: leader.id,
              label: leader.full_name,
              detail: `${leader.current_streak} day streak`,
              value: `${leader.total_xp.toLocaleString()} XP`,
              href: "/leaders",
            }))}
          />
        </div>
      </div>
    </div>
  );
}

interface RankingItem {
  id: string;
  label: string;
  detail: string;
  value: string;
  href: string;
}

function RankingCard({
  title,
  href,
  emptyLabel,
  items,
}: {
  title: string;
  href: string;
  emptyLabel: string;
  items: RankingItem[];
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        </div>
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <Link href={item.href} className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">{item.label}</span>
                  <span className="block truncate text-xs text-gray-500">{item.detail}</span>
                </span>
                <span className="shrink-0 text-right text-xs font-semibold text-primary">{item.value}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
