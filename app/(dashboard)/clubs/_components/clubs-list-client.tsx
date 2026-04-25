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

export function ClubsListClient() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery<PaginatedClubs>(
    `/clubs?page=${page}&name=${search}`,
    { enabled: true }
  );

  // Debug: Log API response to understand data structure
  if (data?.clubs && data.clubs.length > 0) {
    const firstClub = data.clubs[0];
    if (!firstClub.id) {
      console.warn('First club is missing id field. Club object:', firstClub);
      console.warn('Available fields:', Object.keys(firstClub));
    }
  }

  // Normalize clubs to ensure they all have valid IDs
  // This handles cases where the API might return IDs under different field names
  const validClubs = filterAndNormalizeClubs(data?.clubs || []);

  const handleCreate = async (formData: any) => {
    try {
      const result = await clubsService.create({
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        country: "Nigeria", // default
      });

      if (result.success) {
        setShowCreate(false);
        setShowSuccess(true);
        refetch();
      } else {
        alert(result.error || result.message || "Failed to create club");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred while creating the club");
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
        country: "Nigeria", // default
      });

      if (result.success) {
        setEditingClub(null);
        toast("Club updated successfully");
        refetch();
      } else {
        alert(result.error || result.message || "Failed to update club");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred while updating the club");
    }
  };


  const handleDelete = async (id: string) => {
    try {
      const result = await clubsService.delete(id);
      if (result.success) {
        toast("Club deleted successfully");
        refetch();
      } else {
        toast("Failed to delete club", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };


  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            placeholder="Search clubs..."
            containerClassName="w-full max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
          <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="h-4 w-4" />}>
            All Regions
          </Button>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Create Club
        </Button>
      </div>

      <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
        {data?.clubs && data.clubs.length > 0 && validClubs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
            <p className="text-muted mb-2">Club data is incomplete</p>
            <p className="text-sm text-muted">Some clubs are missing required information. Please contact support.</p>
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
        defaultValues={editingClub ? {
          name: editingClub.name,
          leader: editingClub.leader_name || "",
          state: editingClub.state,
          city: editingClub.city,
          description: editingClub.description,
          whatsappLink: editingClub.url_link,
        } : undefined}
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
