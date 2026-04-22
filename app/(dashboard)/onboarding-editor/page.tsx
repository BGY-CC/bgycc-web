"use client";

import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui";
import { VideoUploadCard } from "./_components/video-upload-card";
import { useQuery } from "@/hooks/use-query";
import { Pathway } from "@/lib/services/pathways";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingEditorPage() {
  const { data: rawData, isLoading } = useQuery<any>("/pathways");

  // useQuery sets data = result.data from the API response
  // API shape: { success, data: { pathways: [...] } }
  // So rawData = { pathways: [...] }
  const pathways: Pathway[] = Array.isArray(rawData)
    ? rawData
    : rawData?.pathways ?? rawData?.data?.pathways ?? [];

  const uploaded = pathways.filter((p) => p.video_link).length;
  const total = pathways.length;

  if (isLoading && pathways.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Editor"
        breadcrumb={[{ label: "Onboarding Editor" }]}
      />

      {/* Section header */}
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm">
              <span className="text-primary text-sm">▶</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-primary tracking-tight">Pathway Videos</h2>
              <p className="text-sm font-medium text-muted mt-1">
                Manage the welcome videos that new members see during onboarding for each pathway.
              </p>
            </div>
          </div>
          <Badge variant="warning" className="px-4 py-1.5 font-bold uppercase tracking-wider">
            {uploaded}/{total} Videos Uploaded
          </Badge>
        </div>

        {/* Video cards */}
        <div className="mt-5 space-y-4">
          {pathways.length > 0 ? (
            pathways.map((p) => (
              <VideoUploadCard
                key={p.id}
                pathway={p.display_name || p.label}
                description={p.description || `Welcome video for the ${p.label} pathway.`}
                initialVideo={p.video_link ? {
                  name: "Welcome Video",
                  size: "External Link",
                  duration: "—",
                  uploaded: "Uploaded",
                  url: p.video_link
                } : undefined}
                slug={p.slug}
              />
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              No pathways found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
