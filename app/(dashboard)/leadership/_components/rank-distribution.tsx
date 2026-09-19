"use client";

import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/use-query";
import type { RankDistributionItem } from "@/lib/services/ranks";

export function RankDistribution() {
  const { data: distribution, isLoading, error, refetch } = useQuery<RankDistributionItem[]>("/admin/ranks/distribution");

  const total = distribution?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0;
  const sorted = [...(distribution ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  return (
    <Card className="border-none shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Rank Distribution</CardTitle>
        </div>
        <CardDescription>Members grouped by current leadership rank</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">Failed to load rank distribution.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-6">
            {sorted.map((item) => {
              const percent = total > 0 ? Math.round(((item.count ?? 0) / total) * 100) : 0;
              return (
                <div key={item.key} className="space-y-2">
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-gray-700">
                      {item.symbol} {item.name}
                    </span>
                    <span className="text-subtle font-medium">
                      {item.count} members · {percent}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500 italic">No rank data available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}