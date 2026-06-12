"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button, Skeleton, useToast } from "@/components/ui";
import { SearchInput, MemberDetailModal } from "@/components/shared";
import { LeadersTable } from "./leaders-table";
import { LeaderStats } from "./leader-stats";
import { useQuery } from "@/hooks/use-query";
import { profilesService, UserProfile } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

export function LeadersListClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId] = useState<string | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all"); // all, leader, member
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, active, at_risk, reset, missed

  const { data: statsData, isLoading: isLoadingStats } = useQuery<{ stats: { active_leaders: number; regular_members: number; total_users: number } }>(
    "/users/stats",
    { enabled: true }
  );

  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (search) params.set("search", search);

  const { data, isLoading, refetch } = useQuery<{ users: UserProfile[]; total_pages: number; total: number }>(
    `/users?${params.toString()}`,
    { enabled: true }
  );

  const filteredUsers = (data?.users || []).filter(user => {
    if (user.role === "super_admin" || user.role === "admin") return false;
    if (roleFilter === "leader") return user.role === "leader";
    if (roleFilter === "member") return user.role !== "leader";
    
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    
    return true;
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const userToUpdate = data?.users.find(u => u.id === userId);
      const result = await profilesService.updateRole(userId, newRole);
      if (result.success) {
        if (newRole === "leader") {
          toast({
            title: `${userToUpdate?.full_name || "User"} is now a leader`,
            description: "They now have leader-level access on the BGYCC App"
          });
        } else {
          toast(`Revoked leader access from ${userToUpdate?.full_name || "User"}`);
        }
        refetch();
      } else {
        toast(result.message || "Failed to update user role", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    }
  };

  const tabs = [
    {
      label: "All Users",
      mobileLabel: "All",
      count: statsData?.stats.total_users || 0,
      value: "all",
    },
    {
      label: "Leaders",
      mobileLabel: "Leaders",
      count: statsData?.stats.active_leaders || 0,
      value: "leader",
    },
    {
      label: "Members",
      mobileLabel: "Members",
      count: statsData?.stats.regular_members || 0,
      value: "member",
    },
  ];

  const statusLabel =
    statusFilter === "all"
      ? "All Statuses"
      : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ");

  return (
    <>
      <LeaderStats stats={statsData?.stats} isLoading={isLoadingStats} />

      <div className="mt-8 flex flex-col gap-4 xl:mt-10 xl:flex-row xl:items-center xl:justify-between">
        <div className="w-full lg:w-auto">
          <SearchInput
            placeholder="Search by email or username"
            containerClassName="w-full lg:w-[320px]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start xl:w-auto xl:justify-end">
          <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-gray-100/50 p-1 sm:w-auto sm:min-w-[360px] sm:grid-cols-3">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setRoleFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-medium transition-all sm:px-4 sm:text-sm",
                  roleFilter === tab.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-primary"
                )}
              >
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="text-[11px] font-medium opacity-80 sm:ml-1 sm:text-xs">
                  {tab.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Button
              variant="outline"
            className="min-h-11 w-full justify-center gap-2 rounded-xl border-gray-200 px-4 text-subtle sm:w-auto sm:justify-start"
              leftIcon={<Filter className="h-4 w-4" />}
            >
              <select 
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="at_risk">At Risk</option>
                <option value="reset">Reset</option>
                <option value="missed">Missed</option>
              </select>
              <span className="truncate">Status: {statusLabel}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-2 flex flex-col gap-1 text-sm font-medium text-subtle sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-sm text-subtle font-medium">
          Showing {filteredUsers.length} of {data?.total || 0} users
        </p>
        <p className="text-sm text-subtle font-medium">
          Sorted by leader status
        </p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <LeadersTable
            users={filteredUsers}
            currentPage={page}
            totalPages={data?.total_pages || 1}
            onPageChange={setPage}
            onUpdateRole={handleUpdateRole}
          />
        )}
      </div>

      <MemberDetailModal
        isOpen={showMemberDetail}
        onClose={() => setShowMemberDetail(false)}
        userId={selectedUserId}
      />
    </>
  );
}
