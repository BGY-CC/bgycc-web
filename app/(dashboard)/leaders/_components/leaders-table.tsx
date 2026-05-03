"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import {
  Badge,
  Button,
  Pagination,
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
      <div className="space-y-4">
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
              className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-5 w-full sm:w-auto">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-background border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                  {user.profile_picture_url ? (
                    <img 
                      src={user.profile_picture_url} 
                      alt={user.full_name || ""} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    (user.full_name || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-primary">
                      {user.full_name || "Unknown User"}
                    </span>
                    {isLeader && (
                      <Badge className="bg-red-50 text-red-600 border-red-100 font-normal px-2 py-0.5 rounded-full">
                        Leader
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-subtle font-medium">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted font-normal mt-1">
                    <span>{clubLocation}</span>
                    <span className="hidden xs:inline">•</span>
                    <span>Joined {platformJoinedDate}</span>
                    {isLeader && leaderSinceDate && (
                      <>
                        <span className="hidden xs:inline">•</span>
                        <span>Leader since {leaderSinceDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end">
                {isLeader ? (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    className="rounded-xl font-normal border-red-200 text-red-600 hover:bg-red-50 h-10 px-4"
                    onClick={() => setRoleChangeTarget({ user, newRole: "member" })}
                  >
                    Revoke leader
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    className="rounded-xl font-normal bg-[#1E293B] hover:bg-[#0F172A] text-white h-10 px-4"
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
        icon={roleChangeTarget?.newRole === "leader" ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
      />
    </>
  );
}
