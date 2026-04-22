"use client";

import { useState } from "react";
import { Plus, RefreshCw, Calendar } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
  ConfirmDialog,
} from "@/components/ui";
import { StatCard, SearchInput } from "@/components/shared";
import { ChecklistItemRow } from "./checklist-item-row";
import { ChecklistModal } from "./checklist-modal";
import { SuccessModal } from "../../clubs/_components/success-modal";
import { useQuery } from "@/hooks/use-query";
import { checklistService, ChecklistItem } from "@/lib/services/checklist";

export function PathwayChecklistsClient() {
  const [tab, setTab] = useState("leadership");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ChecklistItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ChecklistItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [search, setSearch] = useState("");

  const { data: allItems, isLoading, refetch } = useQuery<ChecklistItem[]>("/checklist");

  const handleAdd = async (formData: any) => {
    try {
      const result = await checklistService.create({
        name: formData.title,
        description: formData.description,
        pathway: tab === "leadership" ? "leadership" : "public_speaking",
        day_of_week: 1, // default
        is_active: true,
      });

      if (result.id) { // The API returns the item directly on success
        setShowAdd(false);
        setShowSuccess(true);
        refetch();
      } else {
        alert(result.error || "Failed to add checklist item");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred");
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;
    try {
      const result = await checklistService.update(editTarget.slug, {
        name: formData.title,
        description: formData.description,
      });

      if (result.id) {
        setEditTarget(null);
        refetch();
      } else {
        alert(result.error || "Failed to update item");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred");
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      const result = await checklistService.delete(removeTarget.slug);
      if (result.success) {
        setRemoveTarget(null);
        refetch();
      } else {
        alert(result.error || "Failed to remove item");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred");
    }
  };


  // Map API pathways to Tabs
  const filteredItems = (allItems || []).filter((item) => {
    const matchesTab = item.pathway.toLowerCase().includes(tab.toLowerCase());
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = [
    {
      label: "Total Items",
      value: filteredItems.length,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "Active Tasks",
      value: filteredItems.filter(i => i.is_active).length,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "XP Potential",
      value: filteredItems.reduce((acc, curr) => acc + curr.xp_value, 0),
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  if (isLoading && !allItems) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Pathway tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="leadership">Leadership Pathway</TabsTrigger>
            <TabsTrigger value="public-speaking">Public Speaking Pathway</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
        >
          Add Checklist
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        ))}
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Search Checklist Items"
        containerClassName="max-w-xs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Lists */}
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onEdit={setEditTarget as any}
              onRemove={setRemoveTarget as any}
            />
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            No checklist items found for this pathway.
          </div>
        )}
      </div>

      {/* Modals */}
      <ChecklistModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAdd}
        mode="add"
      />
      <ChecklistModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEdit}
        mode="edit"
        defaultValues={editTarget ?? undefined}
      />
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Checklist Item"
        description="Are you sure you want to remove this checklist? This action cannot be undone."
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Checklist Added Successfully!"
        description="You have successfully added a checklist item."
      />
    </>
  );
}
