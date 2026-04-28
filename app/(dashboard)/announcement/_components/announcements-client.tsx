"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Megaphone, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { AnnouncementModal } from "./announcement-modal";
import { useToast } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import {
  Announcement,
  announcementsService,
} from "@/lib/services/announcements";

export function AnnouncementsClient() {
  const { toast } = useToast();

  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  const contentRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { data: rawData, isLoading, refetch } =
    useQuery<any>(`/community/announcements`);

  const announcements: Announcement[] = useMemo(() => {
    return (
      Array.isArray(rawData)
        ? rawData
        : rawData?.announcements ?? rawData?.data?.announcements ?? []
    ).map((a: Announcement) => ({
      ...a,
      content: a.content ?? "",
    }));
  }, [rawData]);

  // 🔥 detect real overflow (ONLY on mobile width)
  useEffect(() => {
    const checkOverflow = () => {
      const map: Record<string, boolean> = {};

      announcements.forEach((a) => {
        const el = contentRefs.current[a.id];
        if (!el) return;

        // temporarily force mobile constraint measurement
        const isOverflowing =
          el.scrollHeight > el.clientHeight + 1;

        map[a.id] = isOverflowing;
      });

      setOverflowMap(map);
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [announcements]);

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

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;

    try {
      const result = await announcementsService.update(editTarget.id, {
        title: formData.title,
        content: formData.content,
        metadata: {
          delivery: formData.deliveryOptions,
          target:
            formData.targetAudience === "all"
              ? "All Members"
              : formData.selectedClubs,
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
      {/* Search */}
      <div className="w-full bg-white rounded-xl px-3 py-4 sm:p-5 mt-4">
        <SearchInput
          placeholder="Search Announcements"
          containerClassName="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((a) => {
            const content = a.content ?? "";
            const isExpanded = !!expanded[a.id];

            return (
              <div
                key={a.id}
                className="rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background border border-border text-primary">
                    <Megaphone className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-primary">
                      {a.title}
                    </h3>

                    {/* MOBILE clamp container */}
                    <p
                      ref={(el) => {
                        contentRefs.current[a.id] = el;
                      }}
                      className={`mt-1 text-sm text-muted break-words sm:line-clamp-none ${
                        isExpanded ? "" : "line-clamp-3 sm:line-clamp-none"
                      }`}
                    >
                      {content}
                    </p>

                    {/* ONLY show if actual overflow detected on mobile */}
                    {overflowMap[a.id] && (
                      <button
                        onClick={() => toggleExpand(a.id)}
                        className="sm:hidden mt-1 text-xs font-bold text-primary hover:underline"
                      >
                        {isExpanded ? "See less" : "See more"}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditTarget(a)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-background"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted py-10">
            No announcements found.
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnnouncementModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEdit}
        mode="edit"
        defaultValues={editTarget || undefined}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement?"
      />
    </div>
  );
}