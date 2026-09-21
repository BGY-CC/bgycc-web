"use client";

import { Smartphone } from "lucide-react";
import { Modal, ModalContent, ModalHeader } from "@/components/ui";
import type { OnboardingStep } from "@/lib/services/onboarding";

interface OnboardingPreviewModalProps {
  open: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
}

/**
 * Read-only mobile-format preview of the onboarding screens a member sees.
 * Renders every configured step in order using the active (unsaved) flow.
 */
export function OnboardingPreviewModal({
  open,
  onClose,
  steps,
}: OnboardingPreviewModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader
          className="pr-8"
          icon={<Smartphone className="h-5 w-5 text-primary" />}
          title="Onboarding preview"
          description="A read-only preview of the screens members see during onboarding."
        />

        <div className="mx-auto w-full max-w-sm rounded-[2rem] border-4 border-gray-900 bg-gray-50 p-3 shadow-inner">
          <div className="space-y-3">
            {steps.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No steps configured yet.
              </p>
            )}

            {steps.map((step) => (
              <div
                key={step.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {step.type}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-1 text-xs text-muted">{step.description}</p>
                )}

                {step.text && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-background p-3 text-xs text-primary">
                    {step.text}
                  </p>
                )}

                {step.video_url && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-gray-900">
                    <div className="flex h-28 items-center justify-center text-xs text-gray-300">
                      Video
                    </div>
                    <p className="truncate border-t border-white/10 px-3 py-2 text-[11px] text-gray-300">
                      {step.video_url}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
