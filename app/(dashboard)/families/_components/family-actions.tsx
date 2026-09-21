"use client";

import { useState } from "react";
import { GitMerge, ArrowRightLeft } from "lucide-react";
import { Badge, Button, Input, Modal, ModalContent, ModalHeader, ModalFooter, useToast } from "@/components/ui";
import { familiesService, type FamilyChild } from "@/lib/services/families";

interface FamilyActionsProps {
  familyId: string;
  members: FamilyChild[];
  onChanged?: () => void;
}

export function FamilyActions({ familyId, members, onChanged }: FamilyActionsProps) {
  const { toast } = useToast();

  // Merge state
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeParentId, setMergeParentId] = useState("");
  const [merging, setMerging] = useState(false);

  // Split state
  const [splitTarget, setSplitTarget] = useState<FamilyChild | null>(null);
  const [splitParentId, setSplitParentId] = useState("");
  const [splitting, setSplitting] = useState(false);

  const confirmMerge = async () => {
    const secondaryParentId = mergeParentId.trim();
    if (!secondaryParentId) {
      toast("Enter the secondary parent user ID", "error");
      return;
    }
    setMerging(true);
    try {
      const res = await familiesService.merge({ primaryParentId: familyId, secondaryParentId });
      if (res?.success) {
        toast("Families merged");
        setMergeOpen(false);
        setMergeParentId("");
        onChanged?.();
      } else {
        toast(res?.error || res?.message || "Failed to merge families", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Failed to merge families", "error");
    } finally {
      setMerging(false);
    }
  };

  const confirmSplit = async () => {
    if (!splitTarget) return;
    const destinationParentId = splitParentId.trim();
    if (!destinationParentId) {
      toast("Enter the destination parent user ID", "error");
      return;
    }
    setSplitting(true);
    try {
      const res = await familiesService.split({
        parentId: familyId,
        childId: splitTarget.id,
        destinationParentId,
      });
      if (res?.success) {
        toast("Child moved to the destination family");
        setSplitTarget(null);
        setSplitParentId("");
        onChanged?.();
      } else {
        toast(res?.error || res?.message || "Failed to move child", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Failed to move child", "error");
    } finally {
      setSplitting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Family Admin Actions
        </h3>

        <div className="mb-4">
          <Button
            variant="secondary"
            className="h-11 w-full justify-start text-xs font-bold sm:w-auto"
            size="sm"
            leftIcon={<GitMerge className="h-4 w-4" />}
            onClick={() => setMergeOpen(true)}
          >
            Merge families
          </Button>
          <p className="mt-2 text-xs text-muted">
            Adopt every child of a secondary parent under this family. The secondary
            parent&apos;s relationships are soft-ended and logged to the audit trail.
          </p>
        </div>

        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No children to move.
            </p>
          ) : (
            members.map((child) => (
              <div
                key={child.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {child.full_name || "Unnamed child"}
                  </p>
                  <Badge variant="secondary" className="rounded-full capitalize">
                    {child.status}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg"
                  aria-label={`Move ${child.full_name || child.id}`}
                  leftIcon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setSplitParentId("");
                    setSplitTarget(child);
                  }}
                >
                  Move
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Merge modal ─────────────────────────────────────────────────── */}
      <Modal open={mergeOpen} onClose={() => setMergeOpen(false)}>
        <ModalContent className="max-w-lg">
          <ModalHeader
            title="Merge secondary family"
            description={`Adopt every active/pending child of the secondary parent under this family (${familyId}). Children are moved active — no second approval round — and the operation appears in the audit log.`}
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Secondary parent user ID
          </label>
          <Input
            placeholder="Secondary parent user ID"
            value={mergeParentId}
            onChange={(e) => setMergeParentId(e.target.value)}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={() => setMergeOpen(false)} disabled={merging}>
              Cancel
            </Button>
            <Button onClick={() => void confirmMerge()} isLoading={merging} disabled={!mergeParentId.trim()}>
              Merge family
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Split modal ─────────────────────────────────────────────────── */}
      <Modal open={splitTarget !== null} onClose={() => setSplitTarget(null)}>
        <ModalContent className="max-w-lg">
          <ModalHeader
            title="Split child from family"
            description={
              splitTarget
                ? `Move ${splitTarget.full_name || "this child"} to a different family. Their current relationship is soft-ended and they are re-attached active under the destination parent.`
                : ""
            }
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Destination parent user ID
          </label>
          <Input
            placeholder="Destination parent user ID"
            value={splitParentId}
            onChange={(e) => setSplitParentId(e.target.value)}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSplitTarget(null)} disabled={splitting}>
              Cancel
            </Button>
            <Button onClick={() => void confirmSplit()} isLoading={splitting} disabled={!splitParentId.trim()}>
              Move child
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}