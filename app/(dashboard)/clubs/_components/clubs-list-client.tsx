"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button, Skeleton, useToast } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ClubsTable } from "./clubs-table";
import { ClubModal } from "./club-modal";
import { SuccessModal } from "./success-modal";
import { useQuery } from "@/hooks/use-query";
import { clubsService, Club, PaginatedClubs } from "@/lib/services/clubs";
import { profilesService } from "@/lib/services/profiles";
import { filterAndNormalizeClubs } from "@/lib/services/club-utils";
import { useAuth } from "@/hooks/use-auth";
// @ts-expect-error – no types bundled
import { getStates, getLgas } from "nigeria-state-lga-data";

function ClubsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-2 items-center gap-4 border-b border-gray-100 py-3 last:border-b-0 lg:grid-cols-6"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="hidden h-4 w-24 lg:block" />
            <Skeleton className="hidden h-4 w-20 lg:block" />
            <Skeleton className="hidden h-6 w-16 rounded-full lg:block" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClubsListClient() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const allStates: string[] = getStates();
  const cities: string[] = filterState ? getLgas(filterState) : [];

  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (search) params.set("name", search);
  if (filterState) params.set("state", filterState);
  if (filterCity) params.set("city", filterCity);

  const { data, isLoading, refetch } = useQuery<PaginatedClubs>(
    `/clubs?${params.toString()}`,
    { enabled: true },
  );

  // Sort clubs alphabetically by name
  const validClubs = filterAndNormalizeClubs((data?.clubs as unknown as Record<string, unknown>[]) || []).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  interface ClubFormPayload {
    name: string;
    leaderId?: string;
    state: string;
    city: string;
    description?: string;
    whatsappLink?: string;
  }

  const handleCreate = async (formData: ClubFormPayload) => {
    try {
      // If current user is a leader, they are the leader of the club they create
      const leaderId = currentUser?.role === "leader" ? currentUser.id : formData.leaderId;

      // If we are assigning a user as a leader, we should ideally check their status
      // but for now we'll just pass the leader_id to the service.
      
      const result = await clubsService.create({
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        leader_id: leaderId,
        country: "Nigeria",
      });

      if (result.success && leaderId && currentUser?.role !== "leader") {
        // Promote to leader if they aren't one already (Admin assignment)
        await profilesService.updateRole(leaderId, "leader");
      }
      if (result.success) {
        setShowCreate(false);
        setShowSuccess(true);
        refetch();
      } else {
        const errMsg =
          typeof result.error === "string"
            ? result.error
            : result.message || "Failed to create club";
        toast(errMsg, "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred while creating the club", "error");
    }
  };

  const handleEdit = async (formData: ClubFormPayload) => {
    if (!editingClub) return;
    try {
      const result = await clubsService.update(editingClub.id, {
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        leader_id: formData.leaderId,
        country: "Nigeria",
      });

      if (result.success && formData.leaderId && formData.leaderId !== editingClub.leader?.id) {
        // Promote new leader
        await profilesService.updateRole(formData.leaderId, "leader");
      }
      if (result.success) {
        setEditingClub(null);
        toast("Club updated successfully", "success");
        refetch();
      } else {
        const errMsg =
          typeof result.error === "string"
            ? result.error
            : result.message || "Failed to update club";
        toast(errMsg, "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred while updating the club", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await clubsService.delete(id);
      if (result.success) {
        toast("Club deactivated successfully", "success");
        refetch();
      } else {
        toast("Failed to deactivate club", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3 bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
          <SearchInput
            placeholder="Search clubs by name..."
            containerClassName="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-1 items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              {/* State / Region filter */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronDown className="h-4 w-4" />}
                  onClick={() => {
                    setShowStateDropdown((p) => !p);
                    setShowCityDropdown(false);
                  }}
                >
                  {filterState || "All States"}
                </Button>
                {showStateDropdown && (
                  <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 font-medium text-slate-600 transition-colors"
                      onClick={() => {
                        setFilterState("");
                        setFilterCity("");
                        setPage(1);
                        setShowStateDropdown(false);
                      }}
                    >
                      All States
                    </button>
                    {allStates.map((s) => (
                      <button
                        key={s}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                          filterState === s ? "font-semibold text-primary bg-slate-50" : "text-slate-600"
                        }`}
                        onClick={() => {
                          setFilterState(s);
                          setFilterCity("");
                          setPage(1);
                          setShowStateDropdown(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City filter — only visible after state is selected */}
              {filterState && cities.length > 0 && (
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ChevronDown className="h-4 w-4" />}
                    onClick={() => {
                      setShowCityDropdown((p) => !p);
                      setShowStateDropdown(false);
                    }}
                  >
                    {filterCity || "All LGAs"}
                  </Button>
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 font-medium text-slate-600 transition-colors"
                        onClick={() => {
                          setFilterCity("");
                          setPage(1);
                          setShowCityDropdown(false);
                        }}
                      >
                        All LGAs
                      </button>
                      {cities.map((c) => (
                        <button
                          key={c}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                            filterCity === c ? "font-semibold text-primary bg-slate-50" : "text-slate-600"
                          }`}
                          onClick={() => {
                            setFilterCity(c);
                            setPage(1);
                            setShowCityDropdown(false);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              className="sm:ml-auto"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreate(true)}
            >
              Create Club
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 transition-opacity">
        {isLoading && !data ? (
          <ClubsTableSkeleton />
        ) : data?.clubs && data.clubs.length > 0 && validClubs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
            <p className="text-muted mb-2">Club data is incomplete</p>
            <p className="text-sm text-muted">
              Some clubs are missing required information. Please contact support.
            </p>
          </div>
        ) : (
          <ClubsTable
            clubs={validClubs}
            currentPage={page}
            totalPages={data?.total_pages || 1}
            onPageChange={setPage}
            onDelete={handleDelete}
            onEdit={setEditingClub}
          />
        )}
      </div>

      {/* Modals */}
      <ClubModal
        open={showCreate || !!editingClub}
        onClose={() => {
          setShowCreate(false);
          setEditingClub(null);
        }}
        onSuccess={editingClub ? handleEdit : handleCreate}
        mode={editingClub ? "edit" : "create"}
        clubId={editingClub?.id}
        defaultValues={
          editingClub
            ? {
                name: editingClub.name,
                leaderId: editingClub.leader?.id || editingClub.leader_id || "",
                state: editingClub.state,
                city: editingClub.city,
                description: editingClub.description,
                whatsappLink: editingClub.url_link,
              }
            : undefined
        }
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Club Successfully Created"
        description="You have successfully created your club. Leaders will be able to edit this post and republish changes."
      />
    </>
  );
}
