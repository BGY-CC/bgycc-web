"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCw, Calendar, Clock, LayoutGrid, CheckCircle2 } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
  ConfirmDialog,
  useToast,
} from "@/components/ui";
import { StatCard, SearchInput } from "@/components/shared";
import { ChecklistItemRow } from "./checklist-item-row";
import { ChecklistModal } from "./checklist-modal";
import { SuccessModal } from "../../clubs/_components/success-modal";
import { useQuery } from "@/hooks/use-query";
import { checklistService, ChecklistItem } from "@/lib/services/checklist";

export function PathwayChecklistsClient() {
  const { toast } = useToast();
  const [tab, setTab] = useState("leadership");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ChecklistItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ChecklistItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [search, setSearch] = useState("");

  const { data: rawData, isLoading, refetch } = useQuery<any>("/checklist");

  const handleAdd = async (formData: any) => {
    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');

      const result = await checklistService.create({
        name: formData.title,
        slug,
        description: formData.description || "",
        pathway: (tab === "leadership" ? "leadership" : "public_speaking") as any,
        day_of_week: formData.schedule === "Weekly" ? parseInt(formData.day_of_week) : null,
        day_number: formData.schedule === "Specific Day" ? parseInt(formData.day_number) : null,
        cycle_number: formData.schedule === "Specific Day" ? parseInt(formData.cycle_number) : null,
        xp_value: 1, 
        is_active: true,
        is_curriculum_based: false,
        metadata: { 
          type: formData.type, 
          schedule: formData.schedule,
          is_admin_created: true 
        }
      });

      if (result.id || result.success) {
        setShowAdd(false);
        setShowSuccess(true);
        refetch();
      } else {
        toast(result.error || "Failed to add checklist item", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;
    try {
      const result = await checklistService.update(editTarget.slug, {
        name: formData.title,
        description: formData.description,
        day_of_week: formData.schedule === "Weekly" ? parseInt(formData.day_of_week) : null,
        day_number: formData.schedule === "Specific Day" ? parseInt(formData.day_number) : null,
        cycle_number: formData.schedule === "Specific Day" ? parseInt(formData.cycle_number) : null,
        metadata: { ...editTarget.metadata, type: formData.type, schedule: formData.schedule }
      });

      if (result.id || result.success) {
        setEditTarget(null);
        refetch();
        toast("Checklist item updated successfully", "success");
      } else {
        toast(result.error || "Failed to update item", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      const result = await checklistService.delete(removeTarget.slug);
      if (result.success) {
        setRemoveTarget(null);
        refetch();
        toast("The checklist item has been deleted.", "success");
      } else {
        toast(result.error || "Failed to remove item", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const itemsArray = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData) {
      const src = rawData?.leadership ? rawData : rawData?.data ?? rawData;
      return [
        ...(Array.isArray(src.leadership) ? src.leadership : []),
        ...(Array.isArray(src.public_speaking) ? src.public_speaking : []),
      ];
    }
    return [];
  }, [rawData]);

  const filteredItems = useMemo(() => {
    return itemsArray.filter((item: any) => {
      const itemPathway = typeof item.pathway === 'string' ? item.pathway : "";
      const matchesTab = itemPathway.toLowerCase().includes(tab.toLowerCase());
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [itemsArray, tab, search]);

  const sectionedItems = useMemo(() => {
    const everyday = filteredItems.filter(i => {
      const s = i.metadata?.schedule || (i.day_of_week === null && i.day_number === null ? "Everyday" : "");
      return s === "Everyday";
    });
    const weekly = filteredItems.filter(i => {
      const s = i.metadata?.schedule || (i.day_of_week !== null ? "Weekly" : "");
      return s === "Weekly";
    });
    const specific = filteredItems.filter(i => {
      const s = i.metadata?.schedule || (i.day_number !== null ? "Specific Day" : "");
      return s === "Specific Day";
    });

    return { everyday, weekly, specific };
  }, [filteredItems]);

  const stats = [
    {
      label: "Total Checklist Items",
      value: filteredItems.length,
      icon: <LayoutGrid className="h-5 w-5 text-indigo-600" />,
    },
    {
      label: "Everyday",
      value: sectionedItems.everyday.length,
      icon: <RefreshCw className="h-5 w-5 text-green-600" />,
    },
    {
      label: "Weekly",
      value: sectionedItems.weekly.length,
      icon: <Calendar className="h-5 w-5 text-amber-600" />,
    },
    {
      label: "Specific Day",
      value: sectionedItems.specific.length,
      icon: <Clock className="h-5 w-5 text-rose-600" />,
    },
  ];

  if (isLoading && itemsArray.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="leadership" className="data-[state=active]:bg-primary data-[state=active]:text-white">Leadership Pathway</TabsTrigger>
            <TabsTrigger value="public_speaking" className="data-[state=active]:bg-primary data-[state=active]:text-white">Public Speaking Pathway</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
          className="bg-primary hover:bg-primary/90"
        >
          Add Checklist
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        ))}
      </div>

      {/* Search area */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <SearchInput
          placeholder="Search Checklist Items..."
          containerClassName="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Checklist Sections */}
      <div className="space-y-8">
        {/* Everyday Tasks */}
        {sectionedItems.everyday.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Everyday Tasks
              <span className="text-sm font-normal text-slate-400">({sectionedItems.everyday.length})</span>
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm divide-y divide-gray-100">
              {sectionedItems.everyday.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onEdit={setEditTarget}
                  onRemove={setRemoveTarget}
                />
              ))}
            </div>
          </div>
        )}

        {/* Weekly Tasks */}
        {sectionedItems.weekly.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Weekly Tasks
              <span className="text-sm font-normal text-slate-400">({sectionedItems.weekly.length})</span>
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm divide-y divide-gray-100">
              {sectionedItems.weekly.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onEdit={setEditTarget}
                  onRemove={setRemoveTarget}
                />
              ))}
            </div>
          </div>
        )}

        {/* Specific Day & Cycle Tasks */}
        {sectionedItems.specific.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Specific Day & Cycle Tasks
              <span className="text-sm font-normal text-slate-400">({sectionedItems.specific.length})</span>
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm divide-y divide-gray-100">
              {sectionedItems.specific.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onEdit={setEditTarget}
                  onRemove={setRemoveTarget}
                />
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-slate-500 font-normal">No checklist items found for this pathway.</p>
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => setSearch("")}
            >
              Clear Filter
            </Button>
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
        description="You have successfully added a new checklist item to the pathway."
      />
    </div>
  );
}
