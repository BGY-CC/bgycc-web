"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import { useQuery } from "@/hooks/use-query";
import { analyticsService, FunnelStep } from "@/lib/services/analytics";

const PERIOD_OPTIONS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]["value"];

export function AnalyticsClient() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("month");
  const [exporting, setExporting] = useState(false);

  const { data: funnel, isLoading } = useQuery<FunnelStep[]>(() =>
    analyticsService.getFunnel()
  );

  const started = funnel?.find((s) => s.step === "started")?.count ?? 0;
  const completed = funnel?.find((s) => s.step === "completed")?.count ?? 0;
  const conversion = started > 0 ? Math.round((completed / started) * 100) : 0;

  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = await analyticsService.exportCsv(period);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${period}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("CSV export downloaded", "success");
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-48 rounded bg-gray-100" />
              <div className="mt-4 h-8 w-full rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Attendees Started"
          value={started}
          sublabel="Onboarding funnel entry"
        />
        <StatCard
          label="Attendees Completed"
          value={completed}
          sublabel={`${conversion}% conversion`}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Funnel Step</th>
              <th className="px-5 py-3 font-medium">Attendees</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(funnel ?? []).map((row) => (
              <tr key={row.step}>
                <td className="px-5 py-3 text-gray-900">{row.step}</td>
                <td className="px-5 py-3 text-gray-600">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
