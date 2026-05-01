"use client";

import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { AnnouncementsClient } from "./_components/announcements-client";
import { AnnouncementModal } from "./_components/announcement-modal";
import { useToast } from "@/components/ui";
import { announcementsService } from "@/lib/services/announcements";


export default function AnnouncementPage() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (formData: any) => {
    try {
      const result = await announcementsService.create({
        title: formData.title,
        content: formData.content,
        type: "announcement",
        is_active: true,
        metadata: {
          delivery: formData.deliveryOptions,
          target:
            formData.targetAudience === "all"
              ? "All Members"
              : formData.selectedClubs,
        },
      });

      if (result.success) {
        setShowAdd(false);
        toast("Announcement sent successfully!");
      } else {
        toast(result.error || "Failed to send announcement");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        breadcrumb={[{ label: "Announcements" }]}
      />

      {/* Info card */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Left content */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <Megaphone className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Announcements
              </h2>
              <p className="text-sm font-normal text-slate-500">
                Create and manage announcements for BGYCC users
              </p>
            </div>
          </div>

          {/* Right button */}
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAdd(true)}
            className="shrink-0 w-full sm:w-auto bg-[#1A1F36] hover:bg-[#1A1F36]/90 text-white rounded-xl py-6 px-6"
          >
            New Announcement
          </Button>
        </div>
      </div>

      <AnnouncementsClient />

      {/* Modal moved here */}
      <AnnouncementModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAdd}
        mode="add"
      />
    </div>
  );
}