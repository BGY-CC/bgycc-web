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
      <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden divide-y divide-border">
        {resources.map((r) => (
          <div key={r.id} className="flex items-start gap-4 px-6 py-5 hover:bg-background/50 transition-colors group">
            {/* File icon */}
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm group-hover:scale-105 transition-transform">
              <Link2 className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-primary tracking-tight">{r.title}</p>
              <p className="text-[13px] font-medium text-muted mt-1">{r.description}</p>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-accent hover:underline underline-offset-4"
              >
                <ExternalLink className="h-3 w-3" />
                {r.link}
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditTarget(r)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-primary transition-colors border border-transparent hover:border-border"
                aria-label={`Edit ${r.title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(r)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-error-bg hover:text-error transition-colors border border-transparent hover:border-error/20"
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
