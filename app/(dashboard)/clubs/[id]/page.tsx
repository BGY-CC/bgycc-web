import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Activity,
  TrendingUp,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { StatCard, PageHeader } from "@/components/shared";
import { EngagementChart, MemberStatusChart } from "@/components/charts";
import { MOCK_CLUBS } from "../_components/mock-data";

export const metadata: Metadata = { title: "Club Details" };

// ─── Mock performers / at-risk data ──────────────────────────────────────────

const TOP_PERFORMERS = [
  { name: "John Adewale", streak: 44, score: 89 },
  { name: "Grace Obi", streak: 34, score: 87 },
  { name: "Samuel Eze", streak: 28, score: 79 },
  { name: "Faith Nwosu", streak: 25, score: 76 },
  { name: "John Adewale", streak: 21, score: 70 },
];

const AT_RISK_MEMBERS = [
  { name: "John Adewale", reason: "3 consecutive missed reports" },
  { name: "Grace Obi", reason: "Last login: 7d ago" },
  { name: "Samuel Eze", reason: "Streak dropped (2nd time monthly)" },
  { name: "Faith Nwosu", reason: "Missed yesterday's report" },
  { name: "John Adewale", reason: "3 consecutive missed reports" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubDetailPage({ params }: { params: { id: string } }) {
  const club = MOCK_CLUBS.find((c) => c.id === params.id) ?? MOCK_CLUBS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]}
      />

      {/* Club header */}
      <div>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{club.name}</h2>
              <Badge variant={club.status === "Active" ? "active" : "dormant"}>
                {club.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Holistic city, modern leadership approach</p>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {club.leader.charAt(0)}
                </span>
                <span className="font-medium text-gray-700">{club.leader}</span>
                <span className="text-gray-400 text-xs">Leader</span>
              </span>
              <span>{club.region} <span className="text-gray-400 text-xs ml-1">Region</span></span>
              <span>{club.createdAt ?? "8/22/2023"} <span className="text-gray-400 text-xs ml-1">Created</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<MessageCircle className="h-4 w-4" />}
            >
              WhatsApp
            </Button>
            <Button
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              Edit Club
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Clubs" value="8" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Clubs" value="7" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Total Members" value="1,157" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg Club Score" value="76%" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Engagement Trends</h3>
              <p className="text-xs text-gray-500">Reports &amp; logins this week</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <EngagementChart />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Member Status</h3>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>This Week</option>
            </select>
          </div>
          <MemberStatusChart />
        </div>
      </div>

      {/* Top performers + At-risk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Performers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {TOP_PERFORMERS.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                    {p.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">Streak: {p.streak} days</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{p.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            At-Risk Members
          </h3>
          <div className="space-y-3">
            {AT_RISK_MEMBERS.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                    {m.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.reason}</p>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
