"use client";

import { useState } from "react";
import { CheckCircle2, UserCheck, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, Button, useToast } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/use-query";
import {
  leaderRanksService,
  mapPendingApproval,
  type PendingApproval,
  type PendingPayload,
} from "@/lib/services/ranks";

const statusVariant = (
  status: string
): "warning" | "active" | "primary" | "dormant" | "secondary" | "default" => {
  switch (status) {
    case "LEADER_APPROVED":
      return "warning";
    case "CONFIRMED":
      return "active";
    case "PROMOTED":
      return "primary";
    case "REJECTED":
      return "dormant";
    case "UNDER_REVIEW":
      return "secondary";
    default:
      return "default";
  }
};

const statusLabel = (status: string) =>
  status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function PendingApprovals() {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useQuery<PendingPayload>("/ranks/pending");
  const pending = data?.verifications?.map(mapPendingApproval) ?? [];
  const [action, setAction] = useState<{ key: string; type: "confirm" | "revert" } | null>(null);

  const itemKey = (item: PendingApproval) => `${item.memberId}:${item.targetRank.key}`;

  const run = async (item: PendingApproval, type: "confirm" | "revert") => {
    setAction({ key: itemKey(item), type });
    try {
      await leaderRanksService[type](item.memberId, item.targetRank.key);
      toast(type === "confirm" ? "Promotion confirmed" : "Promotion reverted");
      await refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : `Failed to ${type} promotion`, "error");
    } finally {
      setAction(null);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-50 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <UserCheck className="h-5 w-5 text-primary" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
              <p className="text-sm text-red-600">Failed to load pending approvals.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : pending && pending.length > 0 ? (
            pending.map((item) => {
              const key = itemKey(item);
              const isBusy = action?.key === key;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={item.profilePictureUrl || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {(item.memberName || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold truncate text-gray-900">
                          {item.memberName || "Unnamed member"}
                        </p>
                        <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                      </div>
                      <p className="text-xs text-subtle truncate">
                        {item.username ? `@${item.username}` : item.memberId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {item.targetRank.symbol} {item.targetRank.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Target Rank
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isBusy && action?.type === "confirm"}
                        disabled={!!action}
                        onClick={() => run(item, "confirm")}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={isBusy && action?.type === "revert"}
                        disabled={!!action}
                        onClick={() => run(item, "revert")}
                        leftIcon={<XCircle className="h-4 w-4" />}
                      >
                        Revert
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm text-muted-foreground italic">
                No promotions pending your confirmation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}