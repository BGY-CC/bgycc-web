"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ClubsTable } from "./clubs-table";
import { ClubModal } from "./club-modal";
import { SuccessModal } from "./success-modal";
import { useQuery } from "@/hooks/use-query";
import { clubsService, Club, PaginatedClubs } from "@/lib/services/clubs";

export function ClubsListClient() {
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery<PaginatedClubs>(
    `/clubs?page=${page}&name=${search}`,
    { enabled: true }
  );

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
        <ClubsTable 
          clubs={data?.clubs || []} 
          currentPage={page}
          totalPages={data?.total_pages || 1}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <ClubModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreate}
        mode="create"
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
