"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Megaphone, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog, Badge } from "@/components/ui";
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
    const list = Array.isArray(rawData)
      ? rawData
      : rawData?.announcements ?? rawData?.data?.announcements ?? [];

    return list.map((a: any) => {
      let metadata = a.metadata;
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }
      return {
        ...a,
        content: a.content ?? "",
        metadata: metadata ?? {},
      };
    });
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
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
      <div className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <SearchInput
          placeholder="Search Announcements..."
          containerClassName="max-w-md w-full"
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
            const delivery = a.metadata?.delivery || [];
            const targets = Array.isArray(a.metadata?.target) 
              ? a.metadata.target 
              : a.metadata?.target 
                ? [a.metadata.target] 
                : ["All Members"];

            return (
              <div
                key={a.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Megaphone className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-[17px] font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {a.title}
                        </h3>
                        {delivery.map((d: string) => (
                          <Badge 
                            key={d} 
                            className="bg-[#EEF2FF] text-[#4F46E5] border-none px-2 rounded-md text-[10px] uppercase font-semibold tracking-wider"
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>

                      <p
                        ref={(el) => {
                          contentRefs.current[a.id] = el;
                        }}
                        className={`mt-1 text-[14px] text-slate-500 font-normal leading-relaxed break-words ${
                          isExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {content}
                      </p>

                      {overflowMap[a.id] && (
                        <button
                          onClick={() => toggleExpand(a.id)}
                          className="mt-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {isExpanded ? "See less" : "See more"}
                        </button>
                      )}

                      {/* Footer Info */}
                      <div className="mt-4 flex items-center flex-wrap gap-2">
                        {targets.map((t: string) => (
                          <Badge 
                            key={t} 
                            className="bg-slate-100 text-slate-600 border-none font-medium px-3 py-1"
                          >
                            {t}
                          </Badge>
                        ))}
                        <span className="text-slate-300 mx-1">•</span>
                        <span className="text-[13px] text-slate-400 font-normal">
                          {formatDate(a.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditTarget(a)}
                      className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
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