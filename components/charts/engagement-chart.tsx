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

const MOCK_DATA = [
  { day: "Mon", reports: 220, logins: 340 },
  { day: "Tue", reports: 280, logins: 420 },
  { day: "Wed", reports: 350, logins: 510 },
  { day: "Thu", reports: 525, logins: 782 },
  { day: "Fri", reports: 460, logins: 640 },
  { day: "Sat", reports: 390, logins: 580 },
  { day: "Sun", reports: 310, logins: 460 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="capitalize" style={{ color: p.color }}>
          {p.name === "reports" ? "Reports" : "Logins"} : {p.value}
        </p>
      ))}
    </div>
  );
}

export function EngagementChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={MOCK_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e2d6b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1e2d6b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="loginsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c0392b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="reports"
          stroke="#1e2d6b"
          strokeWidth={2}
          fill="url(#reportsGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#1e2d6b" }}
        />
        <Area
          type="monotone"
          dataKey="logins"
          stroke="#c0392b"
          strokeWidth={2}
          fill="url(#loginsGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#c0392b" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
