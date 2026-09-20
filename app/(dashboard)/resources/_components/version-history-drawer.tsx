"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { Button, ConfirmDialog, Modal, ModalContent, ModalHeader, useToast } from "@/components/ui";
import {
  resourcesService,
  Resource,
  ResourceVersionRow,
} from "@/lib/services/resources";

interface VersionHistoryDrawerProps {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
  onRollback?: () => void;
}

export function VersionHistoryDrawer({
  resource,
  open,
  onClose,
  onRollback,
}: VersionHistoryDrawerProps) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<ResourceVersionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ResourceVersionRow | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    if (!resource) return;
    setLoading(true);
    try {
      const result = await resourcesService.listVersions(resource.id);
      setVersions(result?.data?.versions ?? []);
    } catch (error: unknown) {
      toast(
        error instanceof Error ? error.message : "Failed to load version history",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [resource, toast]);

  useEffect(() => {
    if (open && resource) {
      const timer = window.setTimeout(() => {
        void load();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open, resource, load]);

  const handleConfirmRollback = async () => {
    if (!resource || !confirmTarget) return;
    setRestoring(true);
    try {
      await resourcesService.rollback(resource.id, confirmTarget.version);
      toast(`Restored version ${confirmTarget.version}`, "success");
      setConfirmTarget(null);
      await load();
      onRollback?.();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Rollback failed", "error");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalContent className="mx-2 w-[calc(100%-1rem)] max-w-xl p-4 sm:mx-0 sm:p-6">
          <ModalHeader
            className="pr-8"
            icon={<History className="h-5 w-5 text-primary" />}
            title={`Version History — ${resource?.title ?? ""}`}
            description="Every save appends a snapshot. Restore a previous version to roll the resource back."
          />

          <div className="space-y-4">
            {loading && <p className="text-sm text-slate-500">Loading versions…</p>}

            {!loading && versions.length === 0 && (
              <p className="text-sm text-slate-500">No version history yet.</p>
            )}

            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Version {v.version}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                  {v.change_note && (
                    <p className="mt-1 text-xs text-slate-600">{v.change_note}</p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmTarget(v)}
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmRollback}
        isLoading={restoring}
        variant="secondary"
        title="Restore this version?"
        description={`This restores the snapshot from version ${confirmTarget?.version} into the resource and appends a new version to the history.`}
        confirmLabel="Restore version"
      />
    </>
  );
}