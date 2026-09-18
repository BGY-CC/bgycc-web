"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { Button, Textarea, Input, FormField, useToast } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { onboardingService, OnboardingFlow, OnboardingStep } from "@/lib/services/onboarding";

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

  const publish = async () => {
    setIsSaving(true);
    try {
      await onboardingService.updateFlow({
        steps,
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

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-[17px] font-semibold text-primary tracking-tight">
            Onboarding Flow Editor
          </h2>
          <p className="text-sm font-normal text-muted">
            Edit the consent/vision copy and welcome video shown during member onboarding, then publish a new version.
          </p>
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
    </div>
  );
}