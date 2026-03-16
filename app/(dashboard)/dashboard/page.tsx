import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Dashboard" };

// ─── Mock data (replace with API calls in Phase 2) ────────────────────────────

const stats = [
  { label: "Total Active Users", value: "1,286", icon: <Users className="h-4 w-4" />, change: 0 },
  { label: "Avg Daily Reports", value: "847", icon: <FileText className="h-4 w-4" />, change: 0 },
  { label: "Avg Streak Length", value: "14.3 days", icon: <Flame className="h-4 w-4" />, change: 0 },
  { label: "At-Risk Members", value: "27", icon: <AlertTriangle className="h-4 w-4" />, change: 0 },
  { label: "Resets (7 days)", value: "65", icon: <RefreshCw className="h-4 w-4" />, change: 0 },
  { label: "Audio Reports", value: "312", icon: <Mic className="h-4 w-4" />, change: 0 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb={[]} />

      {/* Stat cards — 3-col on md+, 2-col on sm, 1-col on mobile */}
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
        {/* Engagement Trends — takes 2/3 width on desktop */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Engagement Trends</h2>
              <p className="text-xs text-gray-500">Reports &amp; logins this week</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <EngagementChart />
        </div>

        {/* Member Status — takes 1/3 width on desktop */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Member Status</h2>
              <p className="text-xs text-gray-500">Risk distribution</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <MemberStatusChart />
        </div>
      </div>
    </div>
  );
}
