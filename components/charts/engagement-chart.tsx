"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  label: string;
  reports: number;
  active_users: number; // mapped from active_users in API
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="capitalize" style={{ color: p.color }}>
          {p.name === "reports" ? "Reports" : "Active Users"} : {p.value}
        </p>
      ))}
    </div>
  );
}

export function EngagementChart({ data }: { data?: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
        No data available for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1b2559" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#1b2559" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e21d48" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#e21d48" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="5 5" stroke="#e9edf7" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#a3aed0", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#a3aed0", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="reports"
          stroke="#1b2559"
          strokeWidth={4}
          fill="url(#reportsGradient)"
          dot={false}
          activeDot={{ r: 6, fill: "#1b2559", strokeWidth: 2, stroke: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey="active_users"
          stroke="#e21d48"
          strokeWidth={4}
          fill="url(#activeUsersGradient)"
          dot={false}
          activeDot={{ r: 6, fill: "#e21d48", strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
