"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MemberStatusProps {
  data?: {
    active: number;
    at_risk: number;
    reset: number;
    total: number;
  };
}

export function MemberStatusChart({ data }: MemberStatusProps) {
  const chartData = [
    { name: "Active", value: data?.active || 0, color: "#1b2559" },
    { name: "At Risk", value: data?.at_risk || 0, color: "#e21d48" },
    { name: "Reset", value: data?.reset || 0, color: "#cbd5e1" }, // Using a better grey for reset
  ];

  const total = data?.total || 1; // avoid divide by zero
  const getPercent = (val: number) => Math.round((val / total) * 100);

  if (!data || data.total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-gray-400">
        No active members yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value} members`, `${getPercent(Number(value || 0))}%`]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {chartData.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden="true"
            />
            {d.name} – {getPercent(d.value)}%
          </span>
        ))}
      </div>
    </div>
  );
}
