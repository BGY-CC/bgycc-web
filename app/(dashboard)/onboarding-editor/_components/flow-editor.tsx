"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  History,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Button,
  ConfirmDialog,
  Textarea,
  Input,
  FormField,
  useToast,
} from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { onboardingService, OnboardingFlow, OnboardingStep } from "@/lib/services/onboarding";
import { OnboardingPreviewModal } from "./onboarding-preview-modal";
import { OnboardingHistoryDrawer } from "./onboarding-history-drawer";
import { StepEditorModal } from "./step-editor-modal";
import { CORE_STEP_IDS, makeStepId } from "./step-config";

type FlowRawData =
  | OnboardingFlow
  | { data?: OnboardingFlow };

function stepField(step: OnboardingStep, key: "video_url" | "text"): string {
  return typeof step[key] === "string" ? (step[key] as string) : "";
}

export function FlowEditor() {
  const { toast } = useToast();
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState("");
  const [consentText, setConsentText] = useState("");
  const [visionText, setVisionText] = useState("");
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing] = useState<{
    mode: "add" | "edit";
    step: OnboardingStep | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OnboardingStep | null>(null);

  const { data: rawData, refetch } = useQuery<FlowRawData>("/onboarding/flow", {
    onSuccess: (raw) => {
      const next = raw && "steps" in raw ? raw : raw?.data ?? null;
      if (!next) return;
      setWelcomeVideoUrl(stepField(next.steps.find((s) => s.id === "welcome_video") as OnboardingStep, "video_url"));
      setConsentText(stepField(next.steps.find((s) => s.id === "consent") as OnboardingStep, "text"));
      setVisionText(stepField(next.steps.find((s) => s.id === "vision") as OnboardingStep, "text"));
      setSteps(
        [...next.steps]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((s, i) => ({ ...s, order: i + 1 }))
      );
    },
  });

  const flow: OnboardingFlow | null = useMemo(() => {
    if (!rawData) return null;
    if ("steps" in rawData) return rawData;
    return rawData?.data ?? null;
  }, [rawData]);

  const move = (index: number, dir: -1 | 1) => {
    setSteps((current) => {
      const next = [...current];
      const target = index + dir;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  // Fold the dedicated content fields into their matching steps so the
  // preview and published payload reflect unsaved edits. The value is assigned
  // unconditionally (including empty) so clearing a field persists rather than
  // silently leaving the previously saved value in place.
  const withContentOverrides = (list: OnboardingStep[]): OnboardingStep[] =>
    list.map((s) => {
      if (s.id === "welcome_video") {
        return { ...s, video_url: welcomeVideoUrl };
      }
      if (s.id === "consent") {
        return { ...s, text: consentText };
      }
      if (s.id === "vision") {
        return { ...s, text: visionText };
      }
      return s;
    });

  const publish = async () => {
    setIsSaving(true);
    try {
      await onboardingService.updateFlow({
        steps: withContentOverrides(steps),
        consent_text: consentText,
        vision_text: visionText,
        welcome_video_url: welcomeVideoUrl,
        description: "Updated onboarding flow",
      });
      toast("Onboarding flow published", "success");
      refetch();
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Publish failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep = (next: OnboardingStep) => {
    if (editing?.mode === "add") {
      const created: OnboardingStep = {
        ...next,
        id: makeStepId(next.title, steps),
        order: steps.length + 1,
      };
      setSteps((prev) => [...prev, created]);
    } else {
      setSteps((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    }

    if (next.id === "welcome_video") setWelcomeVideoUrl(next.video_url ?? "");
    if (next.id === "consent") setConsentText(next.text ?? "");
    if (next.id === "vision") setVisionText(next.text ?? "");

    setEditing(null);
  };

  const requestDelete = (step: OnboardingStep) => {
    if (CORE_STEP_IDS.includes(step.id)) {
      toast(
        `${step.title} is a core onboarding screen and can't be deleted.`,
        "error"
      );
      return;
    }
    if (steps.length <= 1) {
      toast("At least one onboarding step is required.", "error");
      return;
    }
    setDeleteTarget(step);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setSteps((prev) =>
      prev
        .filter((s) => s.id !== deleteTarget.id)
        .map((s, i) => ({ ...s, order: i + 1 }))
    );
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-[17px] font-semibold text-primary tracking-tight">
              Onboarding Flow Editor
            </h2>
            <p className="text-sm font-normal text-muted">
              Edit the consent/vision copy and welcome video shown during member onboarding, then publish a new version.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<History className="h-4 w-4" />}
              onClick={() => setHistoryOpen(true)}
            >
              Version history
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setEditing({ mode: "add", step: null })}
            >
              Add step
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <FormField label="Welcome video URL" error="">
            <Input
              value={welcomeVideoUrl}
              onChange={(e) => setWelcomeVideoUrl(e.target.value)}
              placeholder="https://cdn.example.com/welcome.mp4"
              readOnly={isSaving}
            />
          </FormField>

          <FormField label="Consent text" error="">
            <Textarea
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              placeholder="Consent shown to members before they join."
              readOnly={isSaving}
            />
          </FormField>

          <FormField label="Vision text" error="">
            <Textarea
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              placeholder="Vision statement shown at the end of onboarding."
              readOnly={isSaving}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-primary">Step order</h3>
          <div className="mt-2 space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{step.title}</p>
                  <p className="truncate text-xs text-muted">{step.description}</p>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${step.title}`}
                    disabled={isSaving}
                    onClick={() => setEditing({ mode: "edit", step })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${step.title}`}
                    disabled={isSaving}
                    onClick={() => requestDelete(step)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${step.title} up`}
                    disabled={index === 0 || isSaving}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${step.title} down`}
                    disabled={index === steps.length - 1 || isSaving}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <span className="text-xs text-muted">
            {flow?.version ? `Version ${flow.version}` : "No published version yet"}
          </span>
          <Button onClick={publish} isLoading={isSaving}>
            {isSaving ? "Publishing…" : "Publish"}
            {!isSaving && <Check className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      <OnboardingPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        steps={withContentOverrides(steps)}
      />

      <OnboardingHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRollback={refetch}
      />

      {editing && (
        <StepEditorModal
          mode={editing.mode}
          step={editing.step}
          onClose={() => setEditing(null)}
          onSave={handleSaveStep}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        variant="destructive"
        title="Delete step?"
        description={`Remove "${deleteTarget?.title ?? ""}" from the onboarding flow?`}
        confirmLabel="Delete step"
        icon={<Trash2 className="h-6 w-6 text-red-500" />}
      />
    </div>
  );
}