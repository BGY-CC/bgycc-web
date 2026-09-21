"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Badge, Button, ConfirmDialog, useToast } from "@/components/ui";
import { clubsService, type AtRiskMember } from "@/lib/services/clubs";

interface AtRiskMemberListProps {
  clubId: string;
  members: AtRiskMember[];
  onSelectMember: (userId: string) => void;
  onBroadcasted?: () => void;
}

export function AtRiskMemberList({
  clubId,
  members,
  onSelectMember,
  onBroadcasted,
}: AtRiskMemberListProps) {
  const { toast } = useToast();
  const [broadcastTarget, setBroadcastTarget] = useState<AtRiskMember | null>(null);
  const [sending, setSending] = useState(false);

  const confirmBroadcast = async () => {
    if (!broadcastTarget) return;
    setSending(true);
    try {
      const result = await clubsService.broadcastAlert(clubId, broadcastTarget.user_id);
      if (result?.success) {
        toast(`Alert sent to ${broadcastTarget.full_name || "member"}`);
        onBroadcasted?.();
      } else {
        toast(result?.error || result?.message || "Failed to send alert", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Failed to send alert", "error");
    } finally {
      setSending(false);
      setBroadcastTarget(null);
    }
  };

  if (members.length === 0) {
    return <div className="text-sm text-gray-500">No at-risk members found.</div>;
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((m, i) => (
          <div
            key={i}
            className="group flex min-h-11 w-full flex-col gap-2 rounded-xl p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
              onClick={() => onSelectMember(m.user_id)}
            >
              <span className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 transition-colors">
                {(m.full_name || "U").charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">
                  {m.full_name || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {m.current_streak === 0 ? "Broken streak" : "Low activity"}
                </p>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              {m.severity === "yellow" && (
                <Badge variant="warning" className="rounded-full px-2.5 py-0.5">
                  Yellow
                </Badge>
              )}
              {m.severity === "red" && (
                <Badge variant="dormant" className="rounded-full px-2.5 py-0.5">
                  Red
                </Badge>
              )}
              {m.severity === "red" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg"
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                  onClick={() => setBroadcastTarget(m)}
                >
                  Broadcast
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={broadcastTarget !== null}
        onClose={() => setBroadcastTarget(null)}
        onConfirm={confirmBroadcast}
        title="Send broadcast alert?"
        description={
          broadcastTarget
            ? `Send an in-app alert to ${broadcastTarget.full_name || "this member"} about their missed checklist? They are currently marked as high risk.`
            : ""
        }
        confirmLabel="Send alert"
        variant="destructive"
        isLoading={sending}
      />
    </>
  );
}