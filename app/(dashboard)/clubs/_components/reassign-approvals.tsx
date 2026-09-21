"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, UserCheck, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, Button, useToast } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reassignApprovalsService, type ReassignApprovalRequest } from "@/lib/services/families";

const statusVariant = (
  status: string
): "warning" | "active" | "primary" | "dormant" | "secondary" | "default" => {
  switch (status) {
    case "pending":
      return "warning";
    case "applied":
    case "confirmed":
      return "active";
    case "rejected":
      return "dormant";
    default:
      return "default";
  }
};

const statusLabel = (status: string) =>
  status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function ReassignApprovals() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ReassignApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<{ id: string; type: "confirm" | "reject" } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reassignApprovalsService.list();
      setRequests(res?.data?.requests ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reassign requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const run = async (request: ReassignApprovalRequest, type: "confirm" | "reject") => {
    setAction({ id: request.id, type });
    try {
      if (type === "confirm") {
        await reassignApprovalsService.confirm(request.id);
        toast("Reassign request applied");
      } else {
        await reassignApprovalsService.reject(request.id);
        toast("Reassign request rejected");
      }
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : `Failed to ${type} request`, "error");
    } finally {
      setAction(null);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-50 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <UserCheck className="h-5 w-5 text-primary" />
          Reassign Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-2 w-16 bg-gray-50 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-100 rounded" />
              </div>
            ))
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => void load()}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : requests.length > 0 ? (
            requests.map((request) => {
              const isBusy = action?.id === request.id;
              const memberCount = `${request.user_ids.length} ${
                request.user_ids.length === 1 ? "member" : "members"
              }`;
              return (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={request.requester_avatar || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {(request.requester_name || request.requested_by || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {request.requester_name || request.requested_by}
                        </p>
                        <Badge variant={statusVariant(request.status)} className="rounded-full capitalize">
                          {statusLabel(request.status)}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-subtle">
                        {request.club_name || "Unknown club"} · {memberCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={isBusy && action?.type === "confirm"}
                      disabled={!!action}
                      onClick={() => void run(request, "confirm")}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      isLoading={isBusy && action?.type === "reject"}
                      disabled={!!action}
                      onClick={() => void run(request, "reject")}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm text-muted-foreground italic">
                No reassign requests pending approval.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}