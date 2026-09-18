"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalFooter, Button, Input, useToast } from "@/components/ui";
import { UserSearchSelect } from "@/components/shared/user-search-select";
import { clubsService } from "@/lib/services/clubs";
import { profilesService } from "@/lib/services/profiles";

interface ReassignMembersModalProps {
  open: boolean;
  userId: string | null;
  mode: "reassign" | "relinkParent";
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReassignMembersModal({
  open,
  userId,
  mode,
  onClose,
  onSuccess,
}: ReassignMembersModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [clubSearch, setClubSearch] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [clubResults, setClubResults] = useState<{ id: string; name: string }[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClubSearch("");
      setSelectedClubId(null);
      setClubResults([]);
      setSelectedParentId(null);
    }
  }, [open]);

  const searchClubs = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setClubResults([]); return; }
    try {
      const res = await clubsService.search(q, 1, 10);
      const raw = res as { data?: { clubs?: { id: string; name: string }[] } };
      setClubResults(raw?.data?.clubs ?? []);
    } catch {
      setClubResults([]);
    }
  }, []);

  const submit = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      if (mode === "reassign") {
        if (!selectedClubId) { toast("Please select a club", "error"); setIsSaving(false); return; }
        await clubsService.reassignMembers(selectedClubId, [userId]);
        toast("Member reassigned", "success");
      } else {
        if (!selectedParentId) { toast("Please select a parent", "error"); setIsSaving(false); return; }
        await profilesService.relinkParent(userId, selectedParentId);
        toast("Parent relinked", "success");
      }
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Action failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled =
    mode === "reassign" ? !selectedClubId : !selectedParentId;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader title={mode === "reassign" ? "Reassign Member" : "Reassign Parent"} />

        <div className="space-y-4 p-5">
          <p className="text-sm text-muted">
            {mode === "reassign"
              ? "Select the club to move this member into."
              : "Select a new parent for this member."}
          </p>

          {mode === "reassign" ? (
            <>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Club name
              </label>
              <Input
                placeholder="Search clubs…"
                value={clubSearch}
                onChange={(e) => {
                  setClubSearch(e.target.value);
                  setSelectedClubId(null);
                  void searchClubs(e.target.value);
                }}
                error={!!selectedClubId}
              />
              {clubResults.length > 0 && !selectedClubId && (
                <ul className="max-h-40 overflow-auto rounded-xl border border-border bg-white text-sm shadow-sm">
                  {clubResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50"
                        onClick={() => {
                          setSelectedClubId(c.id);
                          setClubSearch(c.name);
                          setClubResults([]);
                        }}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <UserSearchSelect
              onChange={(id) => setSelectedParentId(id)}
              placeholder="Search for parent…"
            />
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSaving} disabled={isSubmitDisabled}>
            {mode === "reassign" ? "Reassign" : "Link Parent"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}