"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Trash2, Shield } from "lucide-react";
import {
  Badge,
  Button,
  Pagination,
  ConfirmDialog,
} from "@/components/ui";
import Image from "next/image";
import { UserProfile } from "@/lib/services/profiles";

interface LeadersTableProps {
  users: UserProfile[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
}

export function LeadersTable({
  users,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateRole,
}: LeadersTableProps) {
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: UserProfile; newRole: string } | null>(null);

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {users.map((user) => {
          const isLeader = user.role === "leader";
          const clubLocation = user.club ? `${user.club.city} ${user.club.state}` : "No club location";
          const platformJoinedDate = user.created_at 
            ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : "N/A";
          
          const leaderSinceDate = user.role_assigned_at 
            ? new Date(user.role_assigned_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) 
            : user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : null;
          
          return (
            <div
              key={user.id}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 w-full items-start gap-3 sm:gap-5 lg:w-auto">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-background text-lg font-bold text-primary shadow-sm sm:h-16 sm:w-16 sm:text-xl">
                  {user.profile_picture_url ? (
                    <Image
                      src={user.profile_picture_url}
                      alt={user.full_name || ""}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (user.full_name || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-bold text-primary break-words">
                      {user.full_name || "Unknown User"}
                    </span>
                    {isLeader && (
                      <Badge className="bg-red-50 text-red-600 border-red-100 font-normal px-2 py-0.5 rounded-full text-[11px] sm:text-xs">
                        Leader
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-subtle font-medium break-all">
                    {user.email}
                  </p>
                  <div className="mt-1 flex flex-col gap-1 text-[11px] font-normal text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1 sm:text-[13px]">
                    <span className="break-words">{clubLocation}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Joined {platformJoinedDate}</span>
                    {isLeader && leaderSinceDate && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>Leader since {leaderSinceDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center gap-3 lg:w-auto lg:justify-end">
                {isLeader ? (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    className="min-h-11 w-full justify-center rounded-xl border-red-200 px-4 font-normal text-red-600 hover:bg-red-50 lg:w-auto"
                    onClick={() => setRoleChangeTarget({ user, newRole: "member" })}
                  >
                    Revoke leader
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    className="min-h-11 w-full justify-center rounded-xl bg-[#1E293B] px-4 font-normal text-white hover:bg-[#0F172A] lg:w-auto"
                    onClick={() => setRoleChangeTarget({ user, newRole: "leader" })}
                  >
                    Assign leader
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-border">
            <Shield className="h-12 w-12 text-muted mx-auto mb-3 opacity-20" />
            <p className="text-muted font-medium">No users found matching your criteria.</p>
          </div>
        )}
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
        description={roleChangeTarget?.newRole === "leader" 
          ? `Are you sure you want to promote ${(roleChangeTarget?.user?.full_name || "this user").toUpperCase()} to leader?` 
          : `${(roleChangeTarget?.user?.full_name || "This user").toUpperCase()} will lose all leader-level permissions in the BGYCC app. They'll remain a regular member.`}
        confirmLabel={roleChangeTarget?.newRole === "leader" ? "Assign" : "Yes, revoke access"}
        variant={roleChangeTarget?.newRole === "leader" ? "primary" : "destructive"}
        icon={roleChangeTarget?.newRole === "leader" ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Trash2 className="h-6 w-6 text-red-500" />}
      />
    </>
  );
}
