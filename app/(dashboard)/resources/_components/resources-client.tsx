"use client";

import { useState } from "react";
import { Plus, ExternalLink, Pencil, Trash2, Link2 } from "lucide-react";
import { Button, ConfirmDialog } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ResourceModal } from "./resource-modal";
import { useToast } from "@/components/ui";

interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
}

const MOCK_RESOURCES: Resource[] = [
  { id: "1", title: "Book Library", description: "Leadership classics & Miracle Morning", link: "https://drive.google.com/example4" },
  { id: "2", title: "Vision & Values", description: "BGYCC Vision Handbook", link: "https://drive.google.com/example6" },
  { id: "3", title: "Audio & Video Teachings", description: "Messages, Recordings, and Testimonies", link: "https://drive.google.com/example8" },
  { id: "4", title: "Public Speaking Pathway", description: "Video & Weekly Assignments", link: "https://drive.google.com/example10" },
  { id: "5", title: "Growth Guides", description: "How-to Manuals (e.g., How to Submit Reports)", link: "https://drive.google.com/example12" },
  { id: "6", title: "Mentorship Handbook", description: "Guide for mentors and club leaders", link: "https://drive.google.com/example14" },
  { id: "7", title: "Weekly Challenge Pack", description: "Resource pack for weekly group challenges", link: "https://drive.google.com/example16" },
];

export function ResourcesClient() {
  const { toast } = useToast();
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  const handleDelete = () => {
    setResources((prev) => prev.filter((r) => r.id !== deleteTarget?.id));
    toast("Resource deleted successfully.");
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <SearchInput
          placeholder="Search Resources"
          containerClassName="max-w-xs w-full"
        />
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
          className="shrink-0"
        >
          Add Resource
        </Button>
      </div>

      {/* Resource list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-50">
        {resources.map((r) => (
          <div key={r.id} className="flex items-start gap-3 px-5 py-4">
            {/* File icon */}
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Trash2 className="h-4 w-4 text-gray-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{r.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
              >
                <Link2 className="h-3 w-3" />
                {r.link}
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label={`Open ${r.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setEditTarget(r)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label={`Edit ${r.title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(r)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label={`Delete ${r.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ResourceModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => setShowAdd(false)}
        mode="add"
      />
      <ResourceModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => setEditTarget(null)}
        mode="edit"
        defaultValues={editTarget ?? undefined}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
      />
    </>
  );
}
