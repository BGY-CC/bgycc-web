"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Check, Ban, UserCheck, ShieldCheck, XCircle } from "lucide-react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Textarea,
  useToast,
} from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import { useQuery } from "@/hooks/use-query";
import { useAuth } from "@/hooks/use-auth";
import {
  moderationService,
  ModerationReport,
} from "@/lib/services/moderation";

type ModerationRawData =
  | ModerationReport[]
  | { reports?: ModerationReport[]; data?: { reports?: ModerationReport[] } };

export function ModerationClient() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isModerator = user?.role === "admin" || user?.role === "super_admin";
  const [action, setAction] = useState<"approve" | "resolve" | "mute" | "shadowBan" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState<ModerationReport | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: rawData, isLoading, refetch } = useQuery<ModerationRawData>(
    "/moderation/reports",
    { enabled: isModerator }
  );

  const reports: ModerationReport[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return rawData?.reports ?? rawData?.data?.reports ?? [];
  }, [rawData]);

  const pending = reports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const runAction = async (
    report: ModerationReport,
    kind: "approve" | "resolve" | "mute" | "shadowBan"
  ) => {
    setAction(kind);
    try {
      if (kind === "approve") {
        await moderationService.approveReport(report.id);
      } else if (kind === "resolve") {
        await moderationService.resolveReport(report.id);
      } else if (kind === "mute") {
        await moderationService.muteUser(report.reported_user_id);
      } else {
        await moderationService.shadowBanUser(report.reported_user_id);
      }
      toast(`${report.reason || report.reported_user_id} ${kind === "approve" ? "approved" : "handled"}`, "success");
      refetch();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Action failed", "error");
    } finally {
      setAction(null);
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast("A rejection reason is required", "error");
      return;
    }
    setAction("reject");
    try {
      await moderationService.rejectReport(rejecting.id, reason);
      toast(`${rejecting.reason || rejecting.reported_user_id} rejected`, "success");
      refetch();
      setRejecting(null);
      setRejectReason("");
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

  if (!isModerator) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-3 font-semibold text-primary">Admin access required</h2>
          <p className="mt-1 text-sm text-muted">
            Only admins can review and respond to moderation reports.
          </p>
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
                      onClick={() => runAction(report, "approve")}
                      disabled={action !== null || report.status !== "pending"}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectReason("");
                        setRejecting(report);
                      }}
                      disabled={action !== null || report.status !== "pending"}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
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

      <Modal open={rejecting !== null} onClose={() => setRejecting(null)}>
        <ModalContent className="max-w-lg">
          <ModalHeader
            icon={<XCircle className="h-6 w-6 text-red-500" />}
            title="Reject moderation report"
            description={
              rejecting
                ? `${rejecting.reason || "Report"} — no action will be taken against the reported user.`
                : ""
            }
          />
          <label
            htmlFor="reject-reason"
            className="mb-2 block text-sm font-semibold text-primary"
          >
            Reason
          </label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            placeholder="Why is this report being rejected?"
          />
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setRejecting(null)}
              disabled={action !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitReject}
              isLoading={action === "reject"}
              disabled={action !== null || rejectReason.trim().length === 0}
            >
              Reject report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
