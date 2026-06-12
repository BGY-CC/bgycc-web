"use client";

import { useEffect, useId, useState } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const chartId = useId();
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return <div className="h-[240px] w-full rounded-lg bg-gray-50/50 animate-pulse sm:h-[280px]" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg text-center text-sm text-gray-400 sm:h-[280px]">
        No data available for this period.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${chartId}-reports`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${chartId}-active-users`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="5 5" stroke="#e9edf7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#a3aed0", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
            tickMargin={10}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#a3aed0", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="reports"
            stroke="#1e293b"
            strokeWidth={3}
            fill={`url(#${chartId}-reports)`}
            dot={false}
            activeDot={{ r: 4, fill: "#1e293b", strokeWidth: 2, stroke: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="active_users"
            stroke="#e11d48"
            strokeWidth={3}
            fill={`url(#${chartId}-active-users)`}
            dot={false}
            activeDot={{ r: 4, fill: "#e11d48", strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
