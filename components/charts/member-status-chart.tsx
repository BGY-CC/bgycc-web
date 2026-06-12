import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MemberStatusProps {
  data?: {
    active: number;
    at_risk: number;
    reset?: number;
    inactive?: number;
    total: number;
  };
}

export function MemberStatusChart({ data }: MemberStatusProps) {
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);

  const activeCount = data?.active || 0;
  const atRiskCount = data?.at_risk || 0;
  const resetCount = data?.reset || data?.inactive || 0;
  const total = activeCount + atRiskCount + resetCount;

  const chartData = [
    { name: "Active", value: activeCount, color: "#1b2559" },
    { name: "At Risk", value: atRiskCount, color: "#e21d48" },
    { name: "Reset", value: resetCount, color: "#cbd5e1" },
  ];

  const getPercent = (val: number) => Math.round((val / total) * 100);

  if (!isMounted) {
    return <div className="h-[240px] w-full rounded-lg bg-gray-50/50 animate-pulse sm:h-[280px]" />;
  }

  if (!data || total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg text-center text-sm text-gray-400 sm:h-[280px]">
        No status data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[240px] w-full min-w-0 sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="78%"
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} members`, `${getPercent(Number(value ?? 0))}%`]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold text-error bg-error-bg px-2 py-0.5 rounded-md">
            At-Risk: {getPercent(atRiskCount)}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
        {chartData.map((d) => (
          <span key={d.name} className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            {d.name} – {getPercent(d.value)}%
          </span>
        ))}
      </div>
    </div>
  );
}
