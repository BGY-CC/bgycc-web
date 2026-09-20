"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Tag, X } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  Button,
  FormField,
  Input,
  Textarea,
  Select,
  Badge,
} from "@/components/ui";
import type { ResourceCategoryOption } from "@/lib/services/resources";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().min(1, "Resource link is required"),
  tags: z.array(z.string()),
  version: z.number().int().min(1),
  min_rank_required: z.string().optional(),
  min_streak_required: z.string().optional(),
  pathway: z.enum(["leadership", "public_speaking", ""]).optional(),
  category: z.string().optional(),
});

export type ResourceFormData = z.infer<typeof schema>;

interface ResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: ResourceFormData) => void;
  mode: "add" | "edit";
  defaultValues?: Partial<ResourceFormData>;
  categories?: ResourceCategoryOption[];
}

const PATHWAY_OPTIONS = ["leadership", "public_speaking"] as const;

export function ResourceModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
  categories = [],
}: ResourceModalProps) {
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      link: defaultValues?.link ?? "",
      tags: defaultValues?.tags ?? [],
      version: defaultValues?.version ?? 1,
      min_rank_required: defaultValues?.min_rank_required ?? "",
      min_streak_required: defaultValues?.min_streak_required ?? "",
      pathway: defaultValues?.pathway ?? "",
      category: defaultValues?.category ?? "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const tags = watch("tags") ?? [];
  const version = watch("version") ?? 1;

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title ?? "",
        description: defaultValues?.description ?? "",
        link: defaultValues?.link ?? "",
        tags: defaultValues?.tags ?? [],
        version: defaultValues?.version ?? 1,
        min_rank_required: defaultValues?.min_rank_required ?? "",
        min_streak_required: defaultValues?.min_streak_required ?? "",
        pathway: defaultValues?.pathway ?? "",
        category: defaultValues?.category ?? "",
      });
    } else {
      reset();
    }
  }, [open, reset, defaultValues]);

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, "");
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    setValue("tags", [...tags, value]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setValue("tags", tags.filter((x) => x !== t));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="mx-2 w-[calc(100%-1rem)] max-w-xl p-4 sm:mx-0 sm:p-6">
        <ModalHeader
          className="pr-8"
          icon={<FolderOpen className="h-5 w-5 text-primary" />}
          title={mode === "add" ? "Add Resource" : "Edit Resource"}
          description={
            mode === "add"
              ? "Add a new resource link to the library."
              : "Update the resource link details below."
          }
        />
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4 px-0 pb-2">
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

          <FormField label="Tags" error={errors.tags?.message}>
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.length === 0 && (
                <span className="text-xs text-gray-400">No tags yet — add some below.</span>
              )}
              {tags.map((t) => (
                <Badge key={t} variant="primary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove tag ${t}`}
                    onClick={() => removeTag(t)}
                    className="ml-1 text-white/70 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addTag}
              >
                Add
              </Button>
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Version">
              <div className="flex h-10 items-center gap-3">
                <Badge className="px-3 py-1">Version {version}</Badge>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (mode === "edit") setValue("version", version + 1);
                  }}
                  disabled={mode !== "edit"}
                >
                  Bump version +1
                </Button>
              </div>
            </FormField>

            <FormField label="Minimum Rank">
              <Input placeholder="e.g. gold" {...register("min_rank_required")} />
            </FormField>

            <FormField label="Minimum Streak (days)">
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register("min_streak_required")}
              />
            </FormField>

            <FormField label="Pathway">
              <Select {...register("pathway")}>
                <option value="">No pathway</option>
                {PATHWAY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Category">
              <Select aria-label="Category" {...register("category")}>
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} className="min-h-11 flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="min-h-11 flex-1">
              {mode === "add" ? "Add Resource" : "Save Changes"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
