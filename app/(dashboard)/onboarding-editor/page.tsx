"use client";

import { PageHeader } from "@/components/shared";
import { Badge, Skeleton } from "@/components/ui";
import { VideoUploadCard } from "./_components/video-upload-card";
import { useQuery } from "@/hooks/use-query";
import { Pathway } from "@/lib/services/pathways";

// ─── Page ─────────────────────────────────────────────────────────────────────

function OnboardingEditorSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Onboarding Editor"
        breadcrumb={[{ label: "Onboarding Editor" }]}
      />

      <div className="flex-1 space-y-6 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>

          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="h-4 w-72 max-w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <Skeleton className="mt-4 h-28 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingEditorPage() {
  const { data: rawData, isLoading, refetch } = useQuery<any>("/pathways");

  // useQuery sets data = result.data from the API response
  // API shape: { success, data: { pathways: [...] } }
  // So rawData = { pathways: [...] }
  const pathways: Pathway[] = Array.isArray(rawData)
    ? rawData
    : rawData?.pathways ?? rawData?.data?.pathways ?? [];

  const uploaded = pathways.filter((p) => p.video_link).length;
  const total = pathways.length;

  if (isLoading && pathways.length === 0) {
    return <OnboardingEditorSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Onboarding Editor"
        breadcrumb={[{ label: "Onboarding Editor" }]}
      />

      <div className="flex-1 space-y-6 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        {/* Section header */}
        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm">
                <span className="text-primary text-sm">▶</span>
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-primary tracking-tight">Pathway Videos</h2>
                <p className="text-sm font-normal text-muted mt-1">
                  Manage the welcome videos that new members see during onboarding for each pathway.
                </p>
              </div>
            </div>
            <Badge variant="warning" className="px-4 py-1.5 font-semibold uppercase tracking-wider">
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
                  initialVideo={p.video_link ? { url: p.video_link } : undefined}
                  slug={p.slug}
                  onUploaded={refetch}
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
    </div>
  );
}
