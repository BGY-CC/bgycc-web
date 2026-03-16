"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, PowerOff } from "lucide-react";
import { Badge, ActionMenu, Pagination, type DropdownItem } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import type { Club } from "./types";

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
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["Club", "Region", "Leader", "Members", "Report Rate", "Score", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
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
                  <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      <Link
                        href={`/clubs/${club.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">📍</span>
                        {club.region}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                          {club.leader.charAt(0)}
                        </span>
                        <span className="text-gray-700">{club.leader}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{club.members}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          club.reportRate >= 80
                            ? "text-green-600 font-medium"
                            : club.reportRate >= 60
                              ? "text-orange-500 font-medium"
                              : "text-red-500 font-medium"
                        }
                      >
                        {club.reportRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{club.score}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={club.status === "Active" ? "active" : "dormant"}
                      >
                        {club.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu items={menuItems} align="right" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center border-t border-gray-100 px-4 py-3">
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
