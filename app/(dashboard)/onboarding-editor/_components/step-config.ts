import type { OnboardingStep } from "@/lib/services/onboarding";

export const STEP_TYPES: { value: string; label: string }[] = [
  { value: "form", label: "Form" },
  { value: "club", label: "Club" },
  { value: "video", label: "Video" },
  { value: "consent", label: "Consent" },
  { value: "vision", label: "Vision" },
  { value: "goals", label: "Goals" },
];

/**
 * Screens the editor's dedicated content fields (welcome video URL, consent
 * copy, vision copy) and the member app reference by id. These cannot be
 * re-created with the same id from the editor, so deletion is blocked.
 */
export const CORE_STEP_IDS = ["welcome_video", "consent", "vision"];

export function stepIdFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `custom_${slug || "step"}`;
}

export function makeStepId(title: string, existing: OnboardingStep[]): string {
  const base = stepIdFromTitle(title);
  const ids = new Set(existing.map((s) => s.id));
  if (!ids.has(base)) return base;
  let suffix = 2;
  while (ids.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
}
