"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  clubsService,
  type Club,
  type ImportMemberEntry,
} from "@/lib/services/clubs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ParsedMemberList {
  members: ImportMemberEntry[];
  emails: number;
  ids: number;
  invalid: string[];
}

export function parseMemberList(input: string): ParsedMemberList {
  const members: ImportMemberEntry[] = [];
  const invalid: string[] = [];
  for (const rawToken of input.split(/[\n,;]/)) {
    const token = rawToken.trim();
    if (!token) continue;
    if (EMAIL_RE.test(token)) {
      members.push({ email: token.toLowerCase() });
    } else if (USER_ID_RE.test(token)) {
      members.push({ user_id: token });
    } else {
      invalid.push(token);
    }
  }
  return {
    members,
    emails: members.filter((m) => m.email).length,
    ids: members.filter((m) => m.user_id).length,
    invalid,
  };
}

interface ImportMembersModalProps {
  club: Club | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportMembersModal({
  club,
  onClose,
  onSuccess,
}: ImportMembersModalProps) {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const open = Boolean(club);

  const parsed = useMemo(() => parseMemberList(value), [value]);
  const canSubmit = parsed.members.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!club || !canSubmit) return;
    setSubmitting(true);
    try {
      const result = await clubsService.importMembers(club.id, parsed.members);
      if (result.success && result.data) {
        toast(
          `${result.data.imported} imported, ${result.data.skipped} skipped`,
          "success",
        );
        setValue("");
        onClose();
        onSuccess();
      } else {
        toast(
          typeof result.error === "string"
            ? result.error
            : result.message || "Import failed",
          "error",
        );
      }
    } catch (error: unknown) {
      toast(
        error instanceof Error
          ? error.message
          : "An error occurred during import",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader
          icon={<UserPlus className="h-5 w-5 text-primary" />}
          title={`Import members into ${club?.name ?? "club"}`}
          description="Paste member emails or user IDs — one per line, or comma-separated. Up to 500 at a time."
        />
        <Textarea
          aria-label="Member emails or IDs"
          placeholder={"alice@example.com\nbob@example.com\n3f8a…-uuid"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-[140px] font-mono text-xs"
        />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>{parsed.emails} email{parsed.emails === 1 ? "" : "s"}</span>
          <span>{parsed.ids} member ID{parsed.ids === 1 ? "" : "s"}</span>
          <span>{parsed.members.length} total</span>
        </div>
        {parsed.invalid.length > 0 && (
          <p className="mt-2 text-xs text-error">
            {parsed.invalid.length} unrecognized entries ignored:{" "}
            {parsed.invalid.slice(0, 3).join(", ")}
            {parsed.invalid.length > 3 ? `…` : ""}
          </p>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting} disabled={!canSubmit}>
            Import members
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}