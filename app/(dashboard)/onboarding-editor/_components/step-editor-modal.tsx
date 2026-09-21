"use client";

import { useState } from "react";
import { ListPlus, Pencil } from "lucide-react";
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Textarea,
} from "@/components/ui";
import type { OnboardingStep } from "@/lib/services/onboarding";
import { STEP_TYPES } from "./step-config";

interface StepEditorModalProps {
  mode: "add" | "edit";
  step: OnboardingStep | null;
  onClose: () => void;
  onSave: (step: OnboardingStep) => void;
}

export function StepEditorModal({
  mode,
  step,
  onClose,
  onSave,
}: StepEditorModalProps) {
  const [title, setTitle] = useState(step?.title ?? "");
  const [description, setDescription] = useState(step?.description ?? "");
  const [type, setType] = useState(step?.type ?? "form");
  const [text, setText] = useState(step?.text ?? "");
  const [videoUrl, setVideoUrl] = useState(step?.video_url ?? "");
  const [isMandatory, setIsMandatory] = useState(step?.is_mandatory ?? false);
  const [error, setError] = useState("");

  const isContentStep =
    type === "consent" ||
    type === "vision" ||
    step?.id === "consent" ||
    step?.id === "vision";
  const isVideoStep = type === "video" || step?.id === "welcome_video";

  const handleSave = () => {
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }

    const next: OnboardingStep = {
      id: step?.id ?? "",
      type,
      title: title.trim(),
      description: description.trim(),
      is_mandatory: isMandatory,
      order: step?.order ?? 0,
    };

    if (isVideoStep) next.video_url = videoUrl.trim();
    if (isContentStep) next.text = text;

    onSave(next);
  };

  return (
    <Modal open onClose={onClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader
          className="pr-8"
          icon={
            mode === "add" ? (
              <ListPlus className="h-5 w-5 text-primary" />
            ) : (
              <Pencil className="h-5 w-5 text-primary" />
            )
          }
          title={mode === "add" ? "Add onboarding step" : "Edit onboarding step"}
          description="Configure the content shown on this onboarding screen."
        />

        <div className="space-y-4">
          <FormField label="Title" required error={error}>
            <Input
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Accountability Partner"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              aria-label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short supporting copy for this screen."
            />
          </FormField>

          <FormField label="Type">
            <Select
              aria-label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {STEP_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          {isVideoStep && (
            <FormField label="Video URL">
              <Input
                aria-label="Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://cdn.example.com/welcome.mp4"
              />
            </FormField>
          )}

          {isContentStep && (
            <FormField label="Text">
              <Textarea
                aria-label="Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Copy shown to members on this screen."
              />
            </FormField>
          )}

          <Checkbox
            aria-label="Mandatory"
            label="Mandatory step"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
          />
        </div>

        <ModalFooter className="sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save step</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
