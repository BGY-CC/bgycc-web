"use client";

import { Users } from "lucide-react";

interface LeaderStatsProps {
  stats?: {
    active_leaders: number;
    regular_members: number;
    total_users: number;
  };
  isLoading?: boolean;
}

export function LeaderStats({ stats, isLoading }: LeaderStatsProps) {
  const items = [
    {
      label: "Active Leaders",
      value: stats?.active_leaders ?? 0,
      icon: Users,
    },
    {
      label: "Regular Members",
      value: stats?.regular_members ?? 0,
      icon: Users,
    },
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
        >
          <div className="p-3 rounded-xl bg-gray-100/80">
            <item.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{item.label}</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-primary mt-1">
                {item.value.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
