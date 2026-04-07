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
            <stop offset="5%" stopColor="#1b2559" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#1b2559" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="loginsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e21d48" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#e21d48" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="5 5" stroke="#e9edf7" vertical={false} />
        <XAxis
          dataKey="day"
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
          dataKey="logins"
          stroke="#e21d48"
          strokeWidth={4}
          fill="url(#loginsGradient)"
          dot={false}
          activeDot={{ r: 6, fill: "#e21d48", strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
