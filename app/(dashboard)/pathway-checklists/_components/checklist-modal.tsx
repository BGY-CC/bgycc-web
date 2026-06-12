"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardList } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  Button,
  FormField,
  Input,
  CustomSelect,
  Textarea,
} from "@/components/ui";
import { ChecklistItem } from "@/lib/services/checklist";

const schema = z.object({
  type: z.string().min(1, "Task type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  schedule: z.string().min(1, "Schedule is required"),
  day_of_week: z.string().optional(),
  day_number: z.string().optional(),
  cycle_number: z.string().optional(),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (defaultValues?.metadata?.type as string) ?? "Prayer",
      title: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      schedule: (defaultValues?.metadata?.schedule as string) ?? "Everyday",
      day_of_week: defaultValues?.day_of_week?.toString() ?? "1",
      day_number: defaultValues?.day_number?.toString() ?? "",
      cycle_number: defaultValues?.cycle_number?.toString() ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const schedule = useWatch({ control, name: "schedule" });
  const day_of_week = useWatch({ control, name: "day_of_week" });

  useEffect(() => {
    if (open) {
      reset({
        type: (defaultValues?.metadata?.type as string) ?? "Prayer",
        title: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
        schedule: (defaultValues?.metadata?.schedule as string) ?? 
                 (defaultValues?.day_of_week !== null && defaultValues?.day_of_week !== undefined ? "Weekly" : 
                  (defaultValues?.day_number ? "Specific Day" : "Everyday")),
        day_of_week: defaultValues?.day_of_week?.toString() ?? "1",
        day_number: defaultValues?.day_number?.toString() ?? "",
        cycle_number: defaultValues?.cycle_number?.toString() ?? "",
      });
    } else {
      reset();
    }
  }, [open, reset, defaultValues]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="w-[calc(100vw-1.5rem)] max-w-xl sm:w-full">
        <ModalHeader
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          title={mode === "add" ? "Add Checklist Item" : "Edit Checklist Item"}
          description={
            mode === "add"
              ? "Add a new task to the selected Pathway."
              : "Update the checklist item details below."
          }
        />
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-5 px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Task Type*" error={errors.type?.message}>
              <CustomSelect {...register("type")} value={type} placeholder="Select Type">
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
              </CustomSelect>
            </FormField>

            <FormField label="Schedule*" error={errors.schedule?.message}>
              <CustomSelect {...register("schedule")} value={schedule} placeholder="Select Schedule">
                <option value="Everyday">Everyday</option>
                <option value="Weekly">Weekly</option>
                <option value="Specific Day">Specific Day</option>
              </CustomSelect>
            </FormField>
          </div>

          <FormField label="Title*" error={errors.title?.message}>
            <Input placeholder="e.g. Morning Prayer" {...register("title")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="Detailed description of the task..."
              rows={3}
              {...register("description")}
            />
          </FormField>

          {schedule === "Weekly" && (
            <FormField label="Day of Week" error={errors.day_of_week?.message}>
              <CustomSelect {...register("day_of_week")} value={day_of_week} placeholder="Select Day">
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </CustomSelect>
            </FormField>
          )}

          {schedule === "Specific Day" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Cycle Number" error={errors.cycle_number?.message}>
                <Input type="number" placeholder="e.g. 1" {...register("cycle_number")} />
              </FormField>
              <FormField label="Day Number" error={errors.day_number?.message}>
                <Input type="number" placeholder="e.g. 5" {...register("day_number")} />
              </FormField>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} className="min-h-11 flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="min-h-11 flex-1">
              {mode === "add" ? "Add item" : "Save Changes"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
