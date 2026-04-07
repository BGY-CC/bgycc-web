"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, PowerOff } from "lucide-react";
import { Badge, ActionMenu, Pagination, type DropdownItem } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import type { Club } from "./types";
import { cn } from "@/lib/utils";

interface ClubsTableProps {
  clubs: Club[];
}

export function ClubsTable({ clubs }: ClubsTableProps) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [deactivateTarget, setDeactivateTarget] = useState<Club | null>(null);

  const pageSize = 10;
  const totalPages = Math.ceil(clubs.length / pageSize);
  const paginated = clubs.slice((page - 1) * pageSize, page * pageSize);

  const handleDeactivate = () => {
    toast(`${deactivateTarget?.name} has been deactivated.`);
    setDeactivateTarget(null);
  };

  return (
    <>
      {/* Table wrapper — horizontal scroll on mobile */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border text-left">
                {["Club", "Region", "Leader", "Members", "Report Rate", "Score", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-5 text-[11px] font-bold text-muted uppercase tracking-[0.1em] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((club) => {
                const menuItems: DropdownItem[] = [
                  {
                    label: "View Details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => {},
                  },
                  {
                    label: "Edit Club",
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => {},
                  },
                  {
                    label: "Deactivate",
                    icon: <PowerOff className="h-4 w-4" />,
                    onClick: () => setDeactivateTarget(club),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={club.id} className="hover:bg-background/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                      <Link
                        href={`/clubs/${club.id}`}
                        className="hover:text-accent transition-colors"
                      >
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-subtle font-medium whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span className="text-muted text-sm">📍</span>
                        {club.region}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm">
                          {club.leader.charAt(0)}
                        </span>
                        <span className="text-primary font-bold">{club.leader}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-subtle font-bold">{club.members}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "font-bold",
                          club.reportRate >= 80
                            ? "text-success"
                            : club.reportRate >= 60
                              ? "text-warning"
                              : "text-error"
                        )}
                      >
                        {club.reportRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-subtle font-bold">{club.score}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={club.status === "Active" ? "active" : "dormant"}
                        className="font-bold px-3 py-1.5"
                      >
                        {club.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <ActionMenu items={menuItems} align="right" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center border-t border-border px-4 py-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Club"
        description="Are you sure you want to delete this club? This action cannot be undone."
      />
    </>
  );
}
