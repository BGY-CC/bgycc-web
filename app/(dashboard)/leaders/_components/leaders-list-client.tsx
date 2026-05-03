"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button, Skeleton, useToast } from "@/components/ui";
import { SearchInput, MemberDetailModal } from "@/components/shared";
import { LeadersTable } from "./leaders-table";
import { useQuery } from "@/hooks/use-query";
import { profilesService, UserProfile } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

export function LeadersListClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all"); // all, leader, member
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);

  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (search) params.set("q", search);
  // Note: The backend /users endpoint might not support role filter directly in query params 
  // if it's not implemented yet. I'll check lib/services/profiles.ts again.
  // Assuming we filter client-side if needed, but better to support it in service.

  const { data, isLoading, refetch } = useQuery<{ users: UserProfile[]; total_pages: number }>(
    `/users?${params.toString()}`,
    { enabled: true }
  );

  const filteredUsers = (data?.users || []).filter(user => {
    if (roleFilter === "leader") return user.role === "leader";
    if (roleFilter === "member") return user.role !== "leader";
    return true;
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const result = await profilesService.updateRole(userId, newRole);
      if (result.success) {
        toast(`User role updated to ${newRole} successfully`, "success");
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

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 bg-white lg:p-5 rounded-xl shadow-sm border border-gray-100">
          <SearchInput
            placeholder="Search users by name or email..."
            containerClassName="w-full max-w-md"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ChevronDown className="h-4 w-4" />}
              onClick={() => setShowRoleDropdown((p) => !p)}
            >
              {roleFilter === "all" ? "All Users" : roleFilter === "leader" ? "Leaders" : "Not Leaders"}
            </Button>
            {showRoleDropdown && (
              <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-slate-200 rounded-xl shadow-xl min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
                {[
                  { label: "All Users", value: "all" },
                  { label: "Leaders", value: "leader" },
                  { label: "Not Leaders", value: "member" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors",
                      roleFilter === option.value ? "font-semibold text-primary bg-slate-50" : "text-slate-600"
                    )}
                    onClick={() => {
                      setRoleFilter(option.value);
                      setPage(1);
                      setShowRoleDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
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
            onViewDetails={handleViewDetails}
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
