"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ClubsTable } from "./clubs-table";
import { ClubModal } from "./club-modal";
import { SuccessModal } from "./success-modal";
import { useQuery } from "@/hooks/use-query";
import { clubsService, Club, PaginatedClubs } from "@/lib/services/clubs";
import { filterAndNormalizeClubs } from "@/lib/services/club-utils";
// @ts-ignore – no types bundled
import { getStates, getLgas } from "nigeria-state-lga-data";

export function ClubsListClient() {
  const { toast } = useToast();
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
  const validClubs = filterAndNormalizeClubs(data?.clubs || []).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleCreate = async (formData: any) => {
    try {
      const result = await clubsService.create({
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        country: "Nigeria",
      });
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
    } catch (error: any) {
      toast(error.message || "An error occurred while creating the club", "error");
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editingClub) return;
    try {
      const result = await clubsService.update(editingClub.id, {
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        country: "Nigeria",
      });
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
    } catch (error: any) {
      toast(error.message || "An error occurred while updating the club", "error");
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
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 bg-white lg:p-5 rounded-xl shadow-sm border border-gray-100">
          <SearchInput
            placeholder="Search clubs by name..."
            containerClassName="w-full max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

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

          <Button
            className="ml-auto"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
          >
            Create Club
          </Button>
        </div>
      </div>

      <div
        className={
          isLoading
            ? "opacity-50 pointer-events-none transition-opacity mt-6"
            : "transition-opacity mt-6"
        }
      >
        {data?.clubs && data.clubs.length > 0 && validClubs.length === 0 ? (
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
        defaultValues={
          editingClub
            ? {
                name: editingClub.name,
                leader: editingClub.leader_name || "",
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
