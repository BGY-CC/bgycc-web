"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import {
  Button,
  ConfirmDialog,
  Modal,
  ModalContent,
  ModalHeader,
  useToast,
} from "@/components/ui";
import {
  onboardingService,
  type OnboardingVersion,
} from "@/lib/services/onboarding";

interface OnboardingHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onRollback?: () => void;
}

export function OnboardingHistoryDrawer({
  open,
  onClose,
  onRollback,
}: OnboardingHistoryDrawerProps) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<OnboardingVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<OnboardingVersion | null>(
    null
  );
  const [rollingBack, setRollingBack] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await onboardingService.getVersions();
      setVersions(result?.data?.versions ?? []);
    } catch (error: unknown) {
      toast(
        error instanceof Error ? error.message : "Failed to load version history",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        void load();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open, load]);

  const handleConfirmRollback = async () => {
    if (!confirmTarget) return;
    setRollingBack(true);
    try {
      await onboardingService.rollbackVersion(confirmTarget.id);
      toast(`Rolled back to version ${confirmTarget.version}`, "success");
      setConfirmTarget(null);
      await load();
      onRollback?.();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Rollback failed", "error");
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalContent className="mx-2 w-[calc(100%-1rem)] max-w-xl p-4 sm:mx-0 sm:p-6">
          <ModalHeader
            className="pr-8"
            icon={<History className="h-5 w-5 text-primary" />}
            title="Version History"
            description="Every publish appends a snapshot. Roll back to restore an earlier onboarding flow."
          />

          <div className="space-y-4">
            {loading && <p className="text-sm text-slate-500">Loading versions…</p>}

            {!loading && versions.length === 0 && (
              <p className="text-sm text-slate-500">No version history yet.</p>
            )}

            {versions.map((version, index) => {
              const isLatest = index === 0;
              const creator =
                version.creator?.full_name || version.creator?.email || "Unknown";
              return (
                <div
                  key={version.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Version {version.version}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(version.created_at).toLocaleString()} · {creator}
                    </p>
                    {version.description && (
                      <p className="mt-1 text-xs text-slate-600">
                        {version.description}
                      </p>
                    )}
                  </div>
                  {!isLatest && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Rollback version ${version.version}`}
                      onClick={() => setConfirmTarget(version)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmRollback}
        isLoading={rollingBack}
        variant="secondary"
        title="Rollback to this version?"
        description={`This restores the snapshot from version ${confirmTarget?.version} as a new active version.`}
        confirmLabel="Rollback version"
      />
    </>
  );
}
