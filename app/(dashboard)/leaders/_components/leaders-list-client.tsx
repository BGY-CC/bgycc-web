"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react";
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setShowMemberDetail(true);
  };

  const tabs = [
    { label: `All Users (${statsData?.stats.total_users || 0})`, value: "all" },
    { label: `Leaders (${statsData?.stats.active_leaders || 0})`, value: "leader" },
    { label: `Members (${statsData?.stats.regular_members || 0})`, value: "member" },
  ];

  return (
    <>
      <LeaderStats stats={statsData?.stats} isLoading={isLoadingStats} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-10">
        {/* Search */}
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

        {/* Filters & Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setRoleFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-normal rounded-lg transition-all",
                  roleFilter === tab.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 text-subtle flex items-center gap-0 sm:gap-2 px-3 sm:px-4"
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
              <span className="hidden sm:inline">
                {statusFilter === "all" ? "Leader Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-2">
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
