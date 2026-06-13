"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCw, Calendar, Clock, Users } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
  ConfirmDialog,
  Skeleton,
  useToast,
} from "@/components/ui";
import { StatCard, StatCardSkeleton, SearchInput } from "@/components/shared";
import { ChecklistItemRow } from "./checklist-item-row";
import { ChecklistModal } from "./checklist-modal";
import { SuccessModal } from "../../clubs/_components/success-modal";
import { useQuery } from "@/hooks/use-query";
import { checklistService, ChecklistItem } from "@/lib/services/checklist";

function PathwayChecklistsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full rounded-xl sm:w-96" />
        <Skeleton className="h-11 w-full rounded-2xl sm:w-36" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
      </div>

      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-64 max-w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PathwayChecklistsClient() {
  const { toast } = useToast();
  const [tab, setTab] = useState("leadership");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ChecklistItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ChecklistItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [search, setSearch] = useState("");

  interface ChecklistApiResponse {
    leadership?: ChecklistItem[];
    public_speaking?: ChecklistItem[];
    data?: { leadership?: ChecklistItem[]; public_speaking?: ChecklistItem[] };
  }
  type ChecklistRawData = ChecklistItem[] | ChecklistApiResponse;

  const { data: rawData, isLoading, refetch } = useQuery<ChecklistRawData>("/checklist");

  interface ChecklistFormData {
    title: string;
    description?: string;
    type?: string;
    schedule: string;
    day_of_week?: string;
    day_number?: string;
    cycle_number?: string;
    is_active: boolean;
  }

  const handleAdd = async (formData: ChecklistFormData) => {
    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');

      const result = await checklistService.create({
        name: formData.title,
        slug,
        description: formData.description || "",
        pathway: tab === "leadership" ? "leadership" : "public_speaking",
        day_of_week: formData.schedule === "Weekly" ? parseInt(formData.day_of_week ?? "0") : null,
        day_number: formData.schedule === "Specific Day" ? parseInt(formData.day_number ?? "0") : null,
        cycle_number: formData.schedule === "Specific Day" ? parseInt(formData.cycle_number ?? "0") : null,
        xp_value: 1,
        is_active: formData.is_active,
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
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    }
  };

  const handleEdit = async (formData: ChecklistFormData) => {
    if (!editTarget) return;
    try {
      const result = await checklistService.update(editTarget.slug, {
        name: formData.title,
        description: formData.description,
        day_of_week: formData.schedule === "Weekly" ? parseInt(formData.day_of_week ?? "0") : null,
        day_number: formData.schedule === "Specific Day" ? parseInt(formData.day_number ?? "0") : null,
        cycle_number: formData.schedule === "Specific Day" ? parseInt(formData.cycle_number ?? "0") : null,
        is_active: formData.is_active,
        metadata: { ...editTarget.metadata, type: formData.type, schedule: formData.schedule }
      });

      if (result.id || result.success) {
        setEditTarget(null);
        refetch();
        toast("Checklist item updated successfully", "success");
      } else {
        toast(result.error || "Failed to update item", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
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
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    }
  };

  const itemsArray = useMemo<ChecklistItem[]>(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData) {
      const src = rawData.leadership ? rawData : rawData.data ?? rawData;
      return [
        ...(Array.isArray(src.leadership) ? src.leadership : []),
        ...(Array.isArray(src.public_speaking) ? src.public_speaking : []),
      ];
    }
    return [];
  }, [rawData]);

  const filteredItems = useMemo(() => {
    return itemsArray.filter((item) => {
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
      icon: <Users />,
      color: "#4F46E5", // Indigo-600
    },
    {
      label: "Everyday",
      value: sectionedItems.everyday.length,
      icon: <RefreshCw />,
      color: "#68A43E",
    },
    {
      label: "Weekly",
      value: sectionedItems.weekly.length,
      icon: <Calendar />,
      color: "#A98B25",
    },
    {
      label: "Specific Day",
      value: sectionedItems.specific.length,
      icon: <Clock />,
      color: "#B20C22",
    },
  ];

  if (isLoading && itemsArray.length === 0) {
    return <PathwayChecklistsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-full lg:w-auto">
          <TabsList className="grid w-full grid-cols-2 gap-1 bg-primary p-1 lg:w-auto lg:min-w-[420px]">
            <TabsTrigger
              value="leadership"
              className="flex min-h-11 flex-col items-center justify-center px-2 text-center text-white hover:bg-white hover:text-primary data-[state=active]:bg-[#B20C22] data-[state=active]:text-white data-[state=active]:hover:bg-[#B20C22] data-[state=active]:hover:text-white sm:flex-none sm:px-5"
            >
              <span className="sm:hidden">Leadership</span>
              <span className="hidden sm:inline">Leadership Pathway</span>
            </TabsTrigger>
            <TabsTrigger
              value="public_speaking"
              className="flex min-h-11 flex-col items-center justify-center px-2 text-center text-white hover:bg-white hover:text-primary data-[state=active]:bg-[#B20C22] data-[state=active]:text-white data-[state=active]:hover:bg-[#B20C22] data-[state=active]:hover:text-white sm:flex-none sm:px-5"
            >
              <span className="sm:hidden">Public Speaking</span>
              <span className="hidden sm:inline">Public Speaking Pathway</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
          className="min-h-11 w-full bg-primary hover:bg-primary/90 lg:w-auto"
        >
          Add Checklist
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <SearchInput
          placeholder="Search Checklist Items..."
          containerClassName="w-full sm:max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {sectionedItems.everyday.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Everyday Tasks
            </h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:space-y-4 sm:divide-y-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
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

        {sectionedItems.weekly.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Weekly Tasks
            </h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:space-y-4 sm:divide-y-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
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

        {sectionedItems.specific.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Specific Day & Cycle Tasks
            </h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:space-y-4 sm:divide-y-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
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
              className="mt-4 min-h-11"
              onClick={() => setSearch("")}
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>

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
