"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ClubsTable } from "./clubs-table";
import { ClubModal } from "./club-modal";
import { SuccessModal } from "./success-modal";
import { MOCK_CLUBS } from "./mock-data";

export function ClubsListClient() {
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setShowSuccess(true);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            placeholder="Search clubs or leaders..."
            containerClassName="w-full max-w-xs"
          />
          <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="h-4 w-4" />}>
            All Regions
          </Button>
          <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="h-4 w-4" />}>
            Name
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

      <ClubsTable clubs={MOCK_CLUBS} />

      {/* Modals */}
      <ClubModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
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
