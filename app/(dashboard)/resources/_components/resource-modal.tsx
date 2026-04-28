"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  FormField,
  Input,
  Textarea,
} from "@/components/ui";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().min(1, "Resource link is required"),
});

type FormData = z.infer<typeof schema>;

interface ResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: FormData) => void;
  mode: "add" | "edit";
  defaultValues?: Partial<FormData>;
}

export function ResourceModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
}: ResourceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      link: defaultValues?.link ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title ?? "",
        description: defaultValues?.description ?? "",
        link: defaultValues?.link ?? "",
      });
    } else {
      reset();
    }
  }, [open, reset, defaultValues]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-xl">
        <ModalHeader
          icon={<FolderOpen className="h-5 w-5 text-primary" />}
          title={mode === "add" ? "Add Resource" : "Edit Resource"}
          description={
            mode === "add"
              ? "Add a new resource link to the library."
              : "Update the resource link details below."
          }
        />
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4 px-6 pb-8">
          <FormField label="Title" required error={errors.title?.message}>
            <Input placeholder="e.g. Daily Audio Report Guide" {...register("title")} />
          </FormField>

          <FormField label="Description" required error={errors.description?.message}>
            <Textarea
              placeholder="Step-by-step guide for daily audio reports"
              rows={3}
              {...register("description")}
            />
          </FormField>

          <FormField label="Resource Link (Google Drive)" required error={errors.link?.message}>
            <Input
              placeholder="https://drive.google.com/..."
              {...register("link")}
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {mode === "add" ? "Add Resource" : "Save Changes"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
