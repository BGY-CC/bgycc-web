"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, PowerOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Badge,
  ActionMenu,
  Pagination,
  type DropdownItem,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Club } from "@/lib/services/clubs";

type ClubSortField = "name" | "member_count" | "created_at";
type ClubSortDir = "asc" | "desc";

interface ClubsTableProps {
  clubs: Club[];
  currentPage: number;
  totalPages: number;
  sortBy?: ClubSortField;
  sortDir?: ClubSortDir;
  onPageChange: (page: number) => void;
  onSort?: (field: ClubSortField) => void;
  onDelete?: (id: string) => void;
  onEdit?: (club: Club) => void;
  onImport?: (club: Club) => void;
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: ClubSortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-5 whitespace-nowrap">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded text-[11px] font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3 text-primary" />
          ) : (
            <ArrowDown className="h-3 w-3 text-primary" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

export function ClubsTable({
  clubs,
  currentPage,
  totalPages,
  sortBy = "name",
  sortDir = "asc",
  onPageChange,
  onSort,
  onDelete,
  onEdit,
  onImport,
}: ClubsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);

  const handleDeleteConfirm = () => {
    if (onDelete && deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } else {
      toast(`${deleteTarget?.name} has been deleted.`);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* ── Card list (< xl) ──────────────────────────────────────────── */}
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:hidden">
        {clubs.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No clubs found matching your criteria.
          </div>
        ) : (
          clubs.map((club) => {
            if (!club.id) return null;
            const menuItems: DropdownItem[] = [
              {
                label: "View Details",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => router.push(`/clubs/${club.id}`),
              },
              {
                label: "Edit Club",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => onEdit && onEdit(club),
              },
              {
                label: "Import Members",
                icon: <UserPlus className="h-4 w-4" />,
                onClick: () => onImport && onImport(club),
              },
              {
                label: "Deactivate",
                icon: <PowerOff className="h-4 w-4" />,
                onClick: () => setDeleteTarget(club),
                variant: "destructive",
              },
            ];
            return (
              <div
                key={club.id}
                className="px-4 py-4 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-start gap-3">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 transition-colors hover:text-accent">
                        <span className="break-words">{club.name}</span>
                      </span>
                      <Badge
                        variant={club.is_active ? "active" : "dormant"}
                        className="px-3 py-1 whitespace-normal text-center"
                      >
                        {club.is_active ? "Active" : "Dormant"}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Region
                        </p>
                        <p className="mt-1 break-words">
                          {[club.city, club.state].filter(Boolean).join(", ") || "No region"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Leader
                        </p>
                        <p className="mt-1 break-words">
                          {club.leader_name || "No Leader"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Members
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {club.total_members}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Score
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {club.average_streak.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="shrink-0 pt-0.5" onClick={(e) => e.preventDefault()}>
                    <ActionMenu items={menuItems} align="right" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop table (≥ xl) ──────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border text-left">
                <SortableTh
                  label="Club"
                  active={sortBy === "name"}
                  dir={sortDir}
                  onClick={() => onSort?.("name")}
                />
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Region
                </th>
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Leader
                </th>
                <SortableTh
                  label="Members"
                  active={sortBy === "member_count"}
                  dir={sortDir}
                  onClick={() => onSort?.("member_count")}
                />
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Report Rate
                </th>
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Score
                </th>
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clubs.map((club) => {
                // Defensive check: ensure club has a valid id before rendering
                if (!club.id) {
                  console.warn("Club object missing id field:", club);
                  return null;
                }

                const menuItems: DropdownItem[] = [
                  {
                    label: "View Details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => {
                      if (!club.id) {
                        toast("Club details are not available", "error");
                        return;
                      }
                      router.push(`/clubs/${club.id}`);
                    },
                  },
                  {
                    label: "Edit Club",
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => onEdit && onEdit(club),
                  },
                  {
                    label: "Import Members",
                    icon: <UserPlus className="h-4 w-4" />,
                    onClick: () => onImport && onImport(club),
                  },
                  {
                    label: "Deactivate",
                    icon: <PowerOff className="h-4 w-4" />,
                    onClick: () => setDeleteTarget(club),
                    variant: "destructive",
                  },
                ];

                const location =
                  [club.city, club.state].filter(Boolean).join(", ") ||
                  club.region ||
                  "Unknown";

                return (
                  <tr
                    key={club.id}
                    className="hover:bg-background/50 transition-colors group"
                  >
                    {/* Club */}
                    <td className="px-4 py-4 font-semibold text-primary">
                      {club.id ? (
                        <Link
                          href={`/clubs/${club.id}`}
                          className="transition-colors hover:text-accent"
                        >
                          <span className="block max-w-[220px] break-words">
                            {club.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted">{club.name}</span>
                      )}
                    </td>

                    {/* Region */}
                    <td className="px-4 py-4 text-subtle font-normal">
                      <span className="flex items-center gap-2">
                        <span className="text-muted text-sm">📍</span>
                        <span className="max-w-[220px] break-words">{location}</span>
                      </span>
                    </td>

                    {/* Leader */}
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-xs font-semibold text-primary shrink-0 shadow-sm">
                          {(club.leader_name || "L").charAt(0)}
                        </span>
                        <span className="max-w-[200px] break-words text-primary font-semibold">
                          {club.leader_name || "No Leader"}
                        </span>
                      </span>
                    </td>

                    {/* Members */}
                    <td className="px-4 py-4 text-subtle font-semibold">
                      {club.total_members}
                    </td>

                    {/* Report Rate (EMPTY for now) */}
                    <td className="px-4 py-4 text-muted font-normal">—</td>

                    {/* Score (this was wrongly used earlier) */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-primary">
                        {club.average_streak.toFixed(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={club.is_active ? "active" : "dormant"}
                        className="font-semibold px-3 py-1.5"
                      >
                        {club.is_active ? "Active" : "Dormant"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <ActionMenu items={menuItems} align="right" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {clubs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No clubs found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 mb-6 flex items-center justify-center sm:mt-12">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Club"
        description="Are you sure you want to deactivate this club? It will be marked as inactive and hidden from active listings."
      />
    </>
  );
}
