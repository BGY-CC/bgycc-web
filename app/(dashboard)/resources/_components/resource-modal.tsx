"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, ImagePlus, Tag, Upload, X } from "lucide-react";
import Image from "next/image";
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
  Checkbox,
} from "@/components/ui";
import {
  resourcesService,
  type ResourceCategoryOption,
} from "@/lib/services/resources";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().min(1, "Resource link is required"),
  tags: z.array(z.string()),
  version: z.number().int().min(1),
  image_url: z.string().optional(),
  access_level: z.string().optional(),
  is_active: z.boolean(),
  min_rank_required: z.string().optional(),
  min_rank_tier: z.string().optional(),
  min_streak_required: z.string().optional(),
  pathway: z.enum(["leadership", "public_speaking", ""]).optional(),
  category: z.string().optional(),
  access_override: z.enum(["none", "open", "closed"]).optional(),
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
const ACCESS_OVERRIDE_OPTIONS = ["none", "open", "closed"] as const;
const RANK_TIER_OPTIONS = [
  { value: "1", label: "1 — Rising Star" },
  { value: "2", label: "2 — Trainer" },
  { value: "3", label: "3 — Executive Trainer" },
  { value: "4", label: "4 — Master Trainer" },
  { value: "5", label: "5 — Global Trainer" },
] as const;

export function ResourceModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
  categories = [],
}: ResourceModalProps) {
  const [tagInput, setTagInput] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      link: defaultValues?.link ?? "",
      tags: defaultValues?.tags ?? [],
      version: defaultValues?.version ?? 1,
      image_url: defaultValues?.image_url ?? "",
      access_level: defaultValues?.access_level ?? "",
      is_active: defaultValues?.is_active ?? true,
      min_rank_required: defaultValues?.min_rank_required ?? "",
      min_rank_tier: defaultValues?.min_rank_tier ?? "",
      min_streak_required: defaultValues?.min_streak_required ?? "",
      pathway: defaultValues?.pathway ?? "",
      category: defaultValues?.category ?? "",
      access_override: defaultValues?.access_override ?? "none",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const tags = watch("tags") ?? [];
  const version = watch("version") ?? 1;
  const imageUrl = watch("image_url") ?? "";
  const accessOverride = watch("access_override") ?? "none";

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title ?? "",
        description: defaultValues?.description ?? "",
        link: defaultValues?.link ?? "",
        tags: defaultValues?.tags ?? [],
        version: defaultValues?.version ?? 1,
        image_url: defaultValues?.image_url ?? "",
        access_level: defaultValues?.access_level ?? "",
        is_active: defaultValues?.is_active ?? true,
        min_rank_required: defaultValues?.min_rank_required ?? "",
        min_rank_tier: defaultValues?.min_rank_tier ?? "",
        min_streak_required: defaultValues?.min_streak_required ?? "",
        pathway: defaultValues?.pathway ?? "",
        category: defaultValues?.category ?? "",
        access_override: defaultValues?.access_override ?? "none",
      });
    } else {
      reset();
    }
  }, [open, reset, defaultValues]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = (await resourcesService.uploadImage(file)) as {
        success?: boolean;
        data?: { public_url?: string };
      };
      if (result.success && result.data?.public_url) {
        setValue("image_url", result.data.public_url, { shouldDirty: true });
      }
    } catch {
      // Upload failed; the cover URL input below still allows a manual value.
    } finally {
      setIsUploadingCover(false);
    }
  };

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

          <FormField label="Cover image">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                aria-label="Upload cover image"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Cover preview"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-slate-400" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Upload className="h-4 w-4 text-white" />
                </span>
              </button>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  {...register("image_url")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUploadingCover}
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-9"
                >
                  {isUploadingCover ? "Uploading..." : "Upload cover image"}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Cover image"
                className="sr-only"
                onChange={handleCoverChange}
              />
            </div>
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

            <FormField label="Minimum Rank Tier">
              <Select aria-label="Minimum rank tier" {...register("min_rank_tier")}>
                <option value="">No tier requirement</option>
                {RANK_TIER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Access Level">
              <Input placeholder="e.g. member" {...register("access_level")} />
            </FormField>

            <FormField label="Minimum Streak (days)">
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register("min_streak_required")}
              />
            </FormField>

            <FormField label="Access Override">
              <div
                role="radiogroup"
                aria-label="Access override"
                className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200"
              >
                {ACCESS_OVERRIDE_OPTIONS.map((value) => {
                  const active = accessOverride === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`Access override: ${value}`}
                      onClick={() => setValue("access_override", value)}
                      className={`h-10 text-xs font-medium capitalize transition-colors ${
                        active
                          ? "bg-primary text-white"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
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

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="resource-is-active"
                label="Visible to members"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

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
