"use client";

import { useState, useMemo } from "react";
import { Plus, ExternalLink, Pencil, Trash2, FolderOpen, Link2, LayoutGrid } from "lucide-react";
import { Button, ConfirmDialog, Skeleton, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton, SearchInput } from "@/components/shared";
import { ResourceModal } from "./resource-modal";
import { useQuery } from "@/hooks/use-query";
import {
  resourcesService,
  Resource,
} from "@/lib/services/resources";

function ResourcesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-2xl sm:w-36" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 max-w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="hidden gap-2 sm:flex">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
            <Skeleton className="mt-5 h-4 w-2/3 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResourcesClient() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [search, setSearch] = useState("");

  const { data: rawData, isLoading, refetch } = useQuery<any>(`/resources`);

  const resources: Resource[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return rawData?.resources ?? rawData?.data?.resources ?? [];
  }, [rawData]);

  const filteredResources = useMemo(() => {
    return resources.filter(r => 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const stats = [
    {
      label: "Total Resources",
      value: resources.length,
      icon: <FolderOpen className="h-5 w-5 text-indigo-600" />,
    },
    {
      label: "Drive Links",
      value: resources.filter(r => r.link?.includes("drive.google.com")).length,
      icon: <Link2 className="h-5 w-5 text-blue-600" />,
    },
  ];

  const handleAdd = async (formData: any) => {
    try {
      const result = await resourcesService.create({
        title: formData.title,
        description: formData.description,
        link: formData.link,
        is_active: true,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });

      if (result.success) {
        setShowAdd(false);
        toast("Resource added successfully", "success");
        refetch();
      } else {
        toast(result.error || "Failed to add resource", "error");
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
        toast("Resource updated successfully", "success");
        refetch();
      } else {
        toast(result.error || "Failed to update resource", "error");
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
        toast("Resource deleted successfully", "success");
        refetch();
      } else {
        toast(result.error || "Failed to delete resource", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Link copied to clipboard", "success");
  };

  if (isLoading && resources.length === 0) {
    return <ResourcesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <SearchInput
          placeholder="Search Resources..."
          containerClassName="max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
          className="bg-primary hover:bg-primary/90"
        >
          Add Resource
        </Button>
      </div>

      {/* Resource list */}
      <div className="space-y-4">
        {filteredResources.length > 0 ? (
          filteredResources.map((r: Resource) => (
            <div
              key={r.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-[14px] text-slate-500 font-normal line-clamp-2 leading-relaxed">
                        {r.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(r.link || "")}
                      className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      title="Copy Link"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditTarget(r)}
                      className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>

                {r.link && (
                  <div className="mt-5 pt-4 border-t border-slate-200 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-slate-400" />
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-normal text-slate-400 hover:text-primary hover:underline underline-offset-4 truncate transition-colors"
                    >
                      {r.link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-slate-500 font-normal">No resources found.</p>
            {search && (
              <Button variant="secondary" className="mt-4" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            )}
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
        defaultValues={
          editTarget
            ? {
                title: editTarget.title,
                description: editTarget.description || "",
                link: editTarget.link || "",
              }
            : undefined
        }
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
      />
    </div>
  );
}
