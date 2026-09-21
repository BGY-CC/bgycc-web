"use client";

import { Users, Sparkles, TrendingUp, Award, Flame, Activity } from "lucide-react";
import { Badge, Button, Skeleton } from "@/components/ui";
import { StatCard } from "@/components/shared";
import type { FamilyStats, FamilyChild } from "@/lib/services/families";

interface FamilyStatsPanelProps {
  stats: FamilyStats | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

const statusVariant = (status: string): "active" | "warning" | "dormant" | "default" => {
  switch (status) {
    case "active":
      return "active";
    case "pending":
      return "warning";
    case "inactive":
      return "dormant";
    default:
      return "default";
  }
};

function ChildRow({ child }: { child: FamilyChild }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-gray-900 truncate">
            {child.full_name || "Unnamed child"}
          </p>
          <Badge variant={statusVariant(child.status)} className="rounded-full capitalize">
            {child.status}
          </Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {child.badges.length > 0 ? (
            child.badges.map((badge) => (
              <span
                key={badge.slug}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"
              >
                <Award className="h-3 w-3" />
                {badge.name || badge.slug}
              </span>
            ))
          ) : (
            <span className="text-[11px] italic text-gray-400">No badges yet</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-red-400" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Current</p>
            <p className="text-sm font-bold text-gray-900 leading-none">{child.streak}d</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-emerald-400" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Longest</p>
            <p className="text-sm font-bold text-gray-900 leading-none">{child.longest_streak}d</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FamilyStatsPanel({
  stats,
  isLoading,
  error,
  onRetry,
}: FamilyStatsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-subtle">Loading family stats…</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50/40 px-6 py-14 text-center">
        <span className="text-sm font-semibold text-red-600">
          {error.message || "Failed to load family stats."}
        </span>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-6 py-14 text-center text-sm text-muted-foreground italic">
        We couldn&apos;t find this family.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats.members.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Active Children"
          value={stats.active_children.toLocaleString()}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Average Streak"
          value={stats.average_streak.toLocaleString()}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Family Badges"
          value={stats.badges.length.toLocaleString()}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Children ({stats.children.length})
        </h3>
        {stats.children.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No children in this family yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {stats.children.map((child) => (
              <ChildRow key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Badges across the family
        </h3>
        {stats.badges.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No badges earned across this family yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <span
                key={badge.slug}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700"
              >
                <Award className="h-3.5 w-3.5" />
                {badge.name || badge.slug}
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-amber-600">
                  {badge.member_count}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}