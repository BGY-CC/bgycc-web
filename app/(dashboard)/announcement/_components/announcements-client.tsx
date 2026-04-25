"use client";

import { useState } from "react";
import { Plus, Megaphone, Pencil, Trash2, Search } from "lucide-react";
import { Button, ConfirmDialog, Badge } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { AnnouncementModal } from "./announcement-modal";
import { useToast } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { Announcement, AnnouncementResponse, announcementsService } from "@/lib/services/announcements";
import { cn } from "@/lib/utils";


export function AnnouncementsClient() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");

  const { data: rawData, isLoading, refetch } = useQuery<any>(`/community/announcements`);

  // useQuery returns result.data; API shape: { announcements: [...] }
  const announcements: Announcement[] = Array.isArray(rawData)
    ? rawData
    : rawData?.announcements ?? rawData?.data?.announcements ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await announcementsService.delete(deleteTarget.id);
      if (result.success) {
        toast("Announcement deleted successfully.");
        setDeleteTarget(null);
        refetch();
      } else {
        toast(result.error || "Failed to delete announcement");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred");
    }
  };

  const handleAdd = async (formData: any) => {
    try {
      const result = await announcementsService.create({
        title: formData.title,
        content: formData.content,
        type: "announcement",
        is_active: true,
        metadata: {
          delivery: formData.deliveryOptions,
          target: formData.targetAudience === "all" ? "All Members" : formData.selectedClubs,
        },
      });

      if (result.success) {
        setShowAdd(false);
        toast("Announcement sent successfully!");
        refetch();
      } else {
        toast(result.error || "Failed to send announcement");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred");
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;
    try {
      const result = await announcementsService.update(editTarget.id, {
        title: formData.title,
        content: formData.content,
        metadata: {
          delivery: formData.deliveryOptions,
          target: formData.targetAudience === "all" ? "All Members" : formData.selectedClubs,
        },
      });

      if (result.success) {
        setEditTarget(null);
        toast("Announcement updated successfully!");
        refetch();
      } else {
        toast(result.error || "Failed to update announcement");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SearchInput
          placeholder="Search Announcements"
          containerClassName="max-w-2xl w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
          className="shrink-0"
        >
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((a: Announcement) => (
            <div key={a.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background border border-border text-primary group-hover:scale-105 transition-transform">
                  <Megaphone className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-primary tracking-tight">{a.title}</h3>
                    {a.metadata?.delivery?.map((d: string) => (
                      <Badge key={d} variant="outline" className="bg-background text-[10px] font-bold px-2 py-0.5">
                        {d}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="mt-1 text-[14px] font-medium text-muted leading-relaxed max-w-2xl">
                    {a.content}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {Array.isArray(a.metadata?.target) ? (
                            a.metadata.target.map((t: string) => (
                                <Badge key={t} className="bg-background text-primary border-border text-[11px] font-bold px-3 py-1">
                                    {t}
                                </Badge>
                            ))
                        ) : (
                            <Badge className="bg-background text-primary border-border text-[11px] font-bold px-3 py-1">
                                {a.metadata?.target || "All Members"}
                            </Badge>
                        )}
                    </div>
                    <span className="text-xs font-bold text-muted">•</span>
                    <span className="text-xs font-bold text-muted">
                        {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditTarget(a)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-background hover:text-primary transition-colors border border-transparent hover:border-border"
                    aria-label="Edit announcement"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-error-bg hover:text-error transition-colors border border-transparent hover:border-error/10"
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted/30" />
            <p className="mt-4 text-sm font-medium text-muted">No announcements found.</p>
          </div>
        )}
      </div>

      <AnnouncementModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAdd}
        mode="add"
      />
      
      {editTarget && (
        <AnnouncementModal
            open={!!editTarget}
            onClose={() => setEditTarget(null)}
            onSuccess={handleEdit}
            mode="edit"
            defaultValues={editTarget}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
}
