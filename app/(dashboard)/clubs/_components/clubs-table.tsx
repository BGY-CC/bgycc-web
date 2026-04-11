"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, PowerOff } from "lucide-react";
import { Badge, ActionMenu, Pagination, type DropdownItem } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Club } from "@/lib/services/clubs";
import { cn } from "@/lib/utils";

interface ClubsTableProps {
  clubs: Club[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ClubsTable({ clubs, currentPage, totalPages, onPageChange }: ClubsTableProps) {
  const { toast } = useToast();
  const [deactivateTarget, setDeactivateTarget] = useState<Club | null>(null);

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
                {["Club", "Location", "Leader", "Members", "Avg Streak", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-5 text-[11px] font-bold text-muted uppercase tracking-[0.1em] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clubs.map((club) => {
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

                const location = [club.city, club.state].filter(Boolean).join(", ") || club.region || "Unknown";

                return (
                  <tr key={club.id} className="hover:bg-background/50 transition-colors group">
                    <td className="px-4 py-4 font-bold text-primary whitespace-nowrap">
                      <Link
                        href={`/clubs/${club.id}`}
                        className="hover:text-accent transition-colors"
                      >
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-subtle font-medium whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span className="text-muted text-sm">📍</span>
                        {location}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm">
                          {(club.leader_name || "L").charAt(0)}
                        </span>
                        <span className="text-primary font-bold">{club.leader_name || "No Leader"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-subtle font-bold">{club.total_members}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-primary">
                        {club.average_streak.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={club.is_active ? "active" : "dormant"}
                        className="font-bold px-3 py-1.5"
                      >
                        {club.is_active ? "Active" : "Dormant"}
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
          {clubs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No clubs found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center border-t border-border px-4 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Club"
        description="Are you sure you want to deactivate this club? This action cannot be undone."
      />
    </>
  );
}
