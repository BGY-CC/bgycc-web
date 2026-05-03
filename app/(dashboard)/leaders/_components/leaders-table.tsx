"use client";

import { useState } from "react";
import { Eye, UserCheck, UserMinus, Shield } from "lucide-react";
import {
  Badge,
  ActionMenu,
  Pagination,
  type DropdownItem,
  ConfirmDialog,
} from "@/components/ui";
import { UserProfile } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

interface LeadersTableProps {
  users: UserProfile[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onViewDetails: (userId: string) => void;
}

export function LeadersTable({
  users,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateRole,
  onViewDetails,
}: LeadersTableProps) {
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: UserProfile; newRole: string } | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border text-left">
                {[
                  "User",
                  "Email",
                  "Role",
                  "Status",
                  "Club",
                  "Joined",
                  "Actions",
                ].map((col) => (
                  <th
                     key={col}
                     className="px-4 py-5 text-[11px] font-semibold text-muted uppercase tracking-[0.1em] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isLeader = user.role === "leader";
                
                const menuItems: DropdownItem[] = [
                  {
                    label: "View Details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => onViewDetails(user.id),
                  },
                  {
                    label: isLeader ? "Unassign Leader" : "Assign as Leader",
                    icon: isLeader ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
                    onClick: () => setRoleChangeTarget({ user, newRole: isLeader ? "member" : "leader" }),
                    variant: isLeader ? "destructive" : "default",
                  },
                ];

                return (
                  <tr key={user.id} className="hover:bg-background/50 transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-xs font-semibold text-primary shrink-0 shadow-sm overflow-hidden">
                          {user.profile_picture_url ? (
                            <img src={user.profile_picture_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (user.full_name || user.email || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-primary font-semibold">
                          {user.full_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-subtle whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={isLeader ? "active" : "default"} className="gap-1 font-semibold">
                        {isLeader && <Shield className="h-3 w-3" />}
                        {user.role || "Member"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={(user.status === "active" || !user.status) ? "active" : "dormant"} className="font-semibold">
                        {user.status || "active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-subtle whitespace-nowrap">
                      {user.club_id ? "Assigned" : "Unassigned"}
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <ActionMenu items={menuItems} align="right" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center mt-12 mb-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>

      <ConfirmDialog
        open={!!roleChangeTarget}
        onClose={() => setRoleChangeTarget(null)}
        onConfirm={() => {
          if (roleChangeTarget) {
            onUpdateRole(roleChangeTarget.user.id, roleChangeTarget.newRole);
            setRoleChangeTarget(null);
          }
        }}
        title={roleChangeTarget?.newRole === "leader" ? "Assign Leader Role" : "Remove Leader Role"}
        description={`Are you sure you want to ${roleChangeTarget?.newRole === "leader" ? "promote" : "demote"} ${roleChangeTarget?.user?.full_name || "this user"} to ${roleChangeTarget?.newRole}?`}
      />
    </>
  );
}
