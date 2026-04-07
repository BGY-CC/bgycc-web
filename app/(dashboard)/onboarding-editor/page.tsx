import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui";
import { VideoUploadCard } from "./_components/video-upload-card";

export const metadata: Metadata = { title: "Onboarding Editor" };

// ─── Mock data ────────────────────────────────────────────────────────────────

const PATHWAYS = [
  {
    pathway: "Leadership Pathway",
    description: "Welcome video shown to members who select the Leadership pathway during onboarding.",
    initialVideo: {
      name: "leadership_welcome_v3.mp4",
      size: "24.5 MB",
      duration: "3:42",
      uploaded: "2025-12-01",
    },
  },
  {
    pathway: "Public Speaking Pathway",
    description: "Welcome video shown to members who select the Public Speaking pathway during onboarding.",
    initialVideo: undefined,
  },
  {
    pathway: "Both Pathways",
    description: "Welcome video for members who choose both Leadership and Public Speaking pathways.",
    initialVideo: {
      name: "both_pathways_intro.mp4",
      size: "31.2 MB",
      duration: "4:18",
      uploaded: "2026-01-15",
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingEditorPage() {
  const uploaded = PATHWAYS.filter((p) => p.initialVideo).length;
  const total = PATHWAYS.length;

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
          {PATHWAYS.map((p) => (
            <VideoUploadCard
              key={p.pathway}
              pathway={p.pathway}
              description={p.description}
              initialVideo={p.initialVideo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
