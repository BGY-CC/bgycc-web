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
  const activeCount = data?.active || 0;
  const atRiskCount = data?.at_risk || 0;
  const resetCount = data?.reset || data?.inactive || 0;
  const total = activeCount + atRiskCount + resetCount || 1;

  const chartData = [
    { name: "Active", value: activeCount, color: "#1b2559" },
    { name: "At Risk", value: atRiskCount, color: "#e21d48" },
    { name: "Reset", value: resetCount, color: "#cbd5e1" },
  ];

  const getPercent = (val: number) => Math.round((val / total) * 100);

  if (!data || total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
        No status data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
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
              formatter={(value: number | string) => [`${value} members`, `${getPercent(Number(value || 0))}%`]}
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
      <div className="mt-4 flex items-center gap-6 flex-wrap justify-center">
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
