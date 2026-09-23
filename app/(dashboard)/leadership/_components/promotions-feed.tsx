"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/use-query";
import type { PromotionsPage } from "@/lib/services/ranks";

const STATUS_STYLES: Record<string, string> = {
  PROMOTED: "bg-green-100 text-green-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  REVERTED: "bg-red-100 text-red-700",
};

const formatDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

export function PromotionsFeed() {
  const { data, isLoading, error, refetch } = useQuery<PromotionsPage>(
    "/admin/promotions?page=1&limit=10"
  );

  const items = data?.items ?? [];

  return (
    <Card className="border-none shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Promotion Log</CardTitle>
        </div>
        <CardDescription>Latest rank transitions across the membership</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">Failed to load promotion log.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {items.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {entry.memberName || "Anonymous"}
                  </p>
                  <p className="text-xs text-subtle truncate">
                    {entry.fromRankName ? `${entry.fromRankName} → ` : ""}
                    {entry.toRankName || entry.toRankKey}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      STATUS_STYLES[entry.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.status}
                  </span>
                  <span className="text-[11px] text-subtle">{formatDate(entry.verifiedAt ?? entry.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500 italic">No promotions recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}