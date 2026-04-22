"use client";

import { useState } from "react";
import { Plus, ExternalLink, Pencil, Trash2, Link2 } from "lucide-react";
import { Button, ConfirmDialog } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { ResourceModal } from "./resource-modal";
import { useToast } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { resourcesService, Resource, ResourceResponse } from "@/lib/services/resources";

export function ResourcesClient() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [search, setSearch] = useState("");

  const { data: rawData, isLoading, refetch } = useQuery<any>(`/resources`);

  // useQuery returns result.data; API shape: { resources: [...] }
  const resources: Resource[] = Array.isArray(rawData)
    ? rawData
    : rawData?.resources ?? rawData?.data?.resources ?? [];

  const handleAdd = async (formData: any) => {
    try {
      const result = await resourcesService.create({
        title: formData.title,
        description: formData.description,
        link: formData.link,
        is_active: true,
        slug: formData.title.toLowerCase().replace(/ /g, "-"), // simple slug
        min_rank_required: "member",
      });

      if (result.success) {
        setShowAdd(false);
        toast("Resource added successfully");
        refetch();
      } else {
        toast("Failed to add resource", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;
    try {
      const result = await resourcesService.update(editTarget.id, {
        title: formData.title,
        description: formData.description,
        link: formData.link,
      });

      if (result.success) {
        setEditTarget(null);
        toast("Resource updated successfully");
        refetch();
      } else {
        toast("Failed to update resource", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await resourcesService.delete(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        toast("Resource deleted successfully");
        refetch();
      } else {
        toast("Failed to delete resource", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };



  if (isLoading && !rawData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <SearchInput
          placeholder="Search Resources"
          containerClassName="max-w-xs w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        {resources.length > 0 ? (
          resources.map((r: Resource) => (
            <div key={r.id} className="flex items-start gap-4 px-6 py-5 hover:bg-background/50 transition-colors group">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm group-hover:scale-105 transition-transform">
                <Link2 className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-primary tracking-tight">{r.title}</p>
                <p className="text-[13px] font-medium text-muted mt-1">{r.description}</p>
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-accent hover:underline underline-offset-4"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {r.link}
                  </a>
                )}
              </div>

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
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            No resources found.
          </div>
        )}
      </div>

      {/* Modals */}
      <ResourceModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAdd}
        mode="add"
      />
      <ResourceModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEdit}
        mode="edit"
        defaultValues={editTarget ? {
          title: editTarget.title,
          description: editTarget.description || "",
          link: editTarget.link || ""
        } : undefined}
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
