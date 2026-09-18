"use client";

import { useEffect, useState } from "react";
import { Download, UserPlus, CheckCircle2 } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import { analyticsService, FunnelRow } from "@/lib/services/analytics";

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
  const [funnelExporting, setFunnelExporting] = useState(false);
  const [rows, setRows] = useState<FunnelRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    analyticsService
      .getFunnelCsv()
      .then((res) => {
        if (!cancelled) setRows(res.rows);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load funnel");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const funnel = rows ?? [];
  const started = funnel.length > 0 ? funnel[0].started : 0;
  const completeRow = funnel.filter((r) => r.step === "complete").pop();
  const completed = completeRow?.completed ?? 0;
  const conversion = started > 0 ? Math.round((completed / started) * 100) : 0;
  const maxStarted = Math.max(...funnel.map((r) => r.started), 1);

  const handleExport = async () => {
    setExporting(true);
    try {
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
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleFunnelExport = async () => {
    setFunnelExporting(true);
    try {
      const { csv } = await analyticsService.getFunnelCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `onboarding-funnel.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("Funnel CSV downloaded", "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Funnel export failed", "error");
    } finally {
      setFunnelExporting(false);
    }
  };

  if (rows === null && !error) {
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
          icon={<UserPlus className="h-5 w-5 text-primary" />}
          description="Onboarding funnel entry"
        />
        <StatCard
          label="Attendees Completed"
          value={completed}
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          description={`${conversion}% conversion`}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleFunnelExport}
            disabled={funnelExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {funnelExporting ? "Exporting…" : "Download Funnel"}
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Funnel Step</th>
              <th className="px-5 py-3 font-medium">Started</th>
              <th className="px-5 py-3 font-medium">Completed</th>
              <th className="px-5 py-3 font-medium">Drop-off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {funnel.map((row) => (
              <tr key={row.step}>
                <td className="px-5 py-3 text-gray-900">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="h-2 rounded-full bg-primary/80"
                      style={{
                        width: Math.max(
                          8,
                          Math.round((row.started / maxStarted) * 120)
                        ),
                      }}
                    />
                    <span>{row.step}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{row.started}</td>
                <td className="px-5 py-3 text-gray-600">{row.completed}</td>
                <td className="px-5 py-3 text-amber-600">{row.dropRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}