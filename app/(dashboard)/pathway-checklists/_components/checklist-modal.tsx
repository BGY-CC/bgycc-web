"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardList } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import type { ChecklistItem } from "./types";

const schema = z.object({
  type: z.string().min(1, "Task type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  schedule: z.string().min(1, "Schedule is required"),
});

type FormData = z.infer<typeof schema>;

interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: FormData) => void;
  mode: "add" | "edit";
  defaultValues?: Partial<ChecklistItem>;
}

export function ChecklistModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
}: ChecklistModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultValues?.type ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      schedule: defaultValues?.schedule ?? "Everyday",
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader
          icon={<ClipboardList className="h-5 w-5 text-gray-600" />}
          title={mode === "add" ? "Add Checklist Item" : "Edit Checklist Item"}
          description={
            mode === "add"
              ? "Add a new task to the Leadership Pathway."
              : "Update the checklist item details below."
          }
        />
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4">
          <FormField label="Task Type" required error={errors.type?.message}>
            <Select {...register("type")}>
              <option value="">Prayer</option>
              <option value="Prayer">Prayer</option>
              <option value="Bible Study">Bible Study</option>
              <option value="Meditation">Meditation</option>
              <option value="Journaling">Journaling</option>
              <option value="Audio Report">Audio Report</option>
              <option value="Mentor Session">Mentor Session</option>
              <option value="Leadership Exercise">Leadership Exercise</option>
              <option value="Affirmations">Affirmations</option>
              <option value="Practice Speech">Practice Speech</option>
              <option value="Watch Video">Watch Video</option>
            </Select>
          </FormField>

          <FormField label="Title" required error={errors.title?.message}>
            <Input placeholder="e.g. Morning Prayer" {...register("title")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="e.g. Morning Prayer"
              rows={3}
              {...register("description")}
            />
          </FormField>

          <FormField label="Schedule" required error={errors.schedule?.message}>
            <Select {...register("schedule")}>
              <option value="Everyday">Everyday</option>
              <option value="Weekly">Weekly</option>
              <option value="Specific Day">Specific Day</option>
            </Select>
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {mode === "add" ? "Add item" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
