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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5 lg:gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-h-28 items-start gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md sm:items-center sm:p-6"
        >
          <div className="rounded-xl bg-gray-100/80 p-3">
            <item.icon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">{item.label}</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
                {item.value.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
