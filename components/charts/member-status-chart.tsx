"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { name: "Active", value: 60, color: "#1b2559" },
  { name: "At Risk", value: 30, color: "#e21d48" },
  { name: "Reset", value: 10, color: "#e9edf7" },
];

export function MemberStatusChart() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {DATA.map((entry) => (
              // Cell is the recharts API for per-segment coloring in Pie charts
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`]}
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
        {DATA.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden="true"
            />
            {d.name} – {d.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
