"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Check, Ban, UserCheck } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import { useQuery } from "@/hooks/use-query";
import {
  moderationService,
  ModerationReport,
} from "@/lib/services/moderation";

type ModerationRawData =
  | ModerationReport[]
  | { reports?: ModerationReport[]; data?: { reports?: ModerationReport[] } };

export function ModerationClient() {
  const { toast } = useToast();
  const [action, setAction] = useState<"resolve" | "mute" | "shadowBan" | null>(null);

  const { data: rawData, isLoading, refetch } = useQuery<ModerationRawData>(
    "/moderation/reports"
  );

  const reports: ModerationReport[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return rawData?.reports ?? rawData?.data?.reports ?? [];
  }, [rawData]);

  const pending = reports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const runAction = async (
    report: ModerationReport,
    kind: "resolve" | "mute" | "shadowBan"
  ) => {
    setAction(kind);
    try {
      if (kind === "resolve") {
        await moderationService.resolveReport(report.id);
      } else if (kind === "mute") {
        await moderationService.muteUser(report.reported_user_id);
      } else {
        await moderationService.shadowBanUser(report.reported_user_id);
      }
      toast(`${report.reason || report.reported_user_id} handled`, "success");
      refetch();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Action failed", "error");
    } finally {
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-40 rounded bg-gray-100" />
              <div className="mt-3 h-4 w-full rounded bg-gray-50" />
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
          label="Pending Reports"
          value={pending}
          icon={<ShieldAlert className="h-5 w-5 text-primary" />}
          description="Awaiting review"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={<Check className="h-5 w-5 text-primary" />}
          description="Handled"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-50 bg-gray-50/50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Reporter</th>
              <th className="px-5 py-3 font-medium">Reported User</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-5 py-3 text-gray-900">{report.reporter_id}</td>
                <td className="px-5 py-3 text-gray-900">{report.reported_user_id}</td>
                <td className="px-5 py-3 text-gray-600">{report.reason}</td>
                <td className="px-5 py-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {report.status === "resolved" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <ShieldAlert className="h-3 w-3 text-amber-600" />
                    )}
                    {report.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(report, "resolve")}
                      disabled={action !== null}
                    >
                      <Check className="h-4 w-4" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(report, "mute")}
                      disabled={action !== null}
                    >
                      <Ban className="h-4 w-4" />
                      Mute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(report, "shadowBan")}
                      disabled={action !== null}
                    >
                      <UserCheck className="h-4 w-4" />
                      Shadow Ban
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(reports ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                  No reports to review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
