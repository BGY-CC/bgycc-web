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
import {
  LEADERSHIP_ITEMS,
  PUBLIC_SPEAKING_ITEMS,
} from "./mock-data";
import type { ChecklistItem } from "./types";

export function PathwayChecklistsClient() {
  const [tab, setTab] = useState("leadership");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ChecklistItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ChecklistItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const items =
    tab === "leadership" ? LEADERSHIP_ITEMS : PUBLIC_SPEAKING_ITEMS;

  const everyday = items.filter((i) => i.schedule === "Everyday");
  const weekly = items.filter((i) => i.schedule === "Weekly");
  const specificDay = items.filter((i) => i.schedule === "Specific Day");

  const handleAddSuccess = () => {
    setShowAdd(false);
    setShowSuccess(true);
  };

  const handleEditSuccess = () => {
    setEditTarget(null);
  };

  const stats = [
    {
      label: "Total Checklist Items",
      value: items.length,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "Everyday",
      value: everyday.length,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "Weekly",
      value: weekly.length,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Specific Day",
      value: specificDay.length,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

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

      {/* Search */}
      <SearchInput
        placeholder="Search Checklist Items"
        containerClassName="max-w-xs"
      />

      {/* Lists */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
        {everyday.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Everyday Tasks</h3>
            {everyday.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onEdit={setEditTarget}
                onRemove={setRemoveTarget}
              />
            ))}
          </section>
        )}

        {weekly.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Weekly Tasks</h3>
            {weekly.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onEdit={setEditTarget}
                onRemove={setRemoveTarget}
              />
            ))}
          </section>
        )}

        {specificDay.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Specific Day &amp; Cycle Tasks
            </h3>
            {specificDay.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onEdit={setEditTarget}
                onRemove={setRemoveTarget}
              />
            ))}
          </section>
        )}
      </div>

      {/* Modals */}
      <ChecklistModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAddSuccess}
        mode="add"
      />
      <ChecklistModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
        mode="edit"
        defaultValues={editTarget ?? undefined}
      />
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => setRemoveTarget(null)}
        title="Remove Checklist Item"
        description="Are you sure you want to remove this checklist? This action cannot be undone."
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Checklist Added Successfully!"
        description="You have successfully added a checklist item. Leaders will be able to edit this post and republish changes."
      />
    </>
  );
}
