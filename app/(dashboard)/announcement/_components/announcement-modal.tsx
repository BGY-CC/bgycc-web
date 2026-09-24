"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Megaphone } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  FormField,
  Input,
  Textarea,
  Checkbox,
  Radio,
  Skeleton,
} from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { PaginatedClubs } from "@/lib/services/clubs";
import { filterAndNormalizeClubs } from "@/lib/services/club-utils";

const schema = z
  .object({
    type: z.enum(["announcement", "event"]),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Message is required"),
    deliveryOptions: z
      .array(z.string())
      .min(1, "Select at least one delivery option"),
    targetAudience: z.enum(["all", "specific"]),
    selectedClubs: z.array(z.string()).optional(),
    event_topic: z.string().optional(),
    event_sub_topic: z.string().optional(),
    event_date: z.string().optional(),
    event_time: z.string().optional(),
    event_location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "event") {
      if (!data.event_topic?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["event_topic"],
          message: "Event topic is required",
        });
      }
      if (!data.event_date) {
        ctx.addIssue({
          code: "custom",
          path: ["event_date"],
          message: "Event date is required",
        });
      }
    }
  });

export type AnnouncementFormData = z.infer<typeof schema>;

interface AnnouncementDefaultValues {
  title?: string | null;
  content?: string | null;
  type?: "announcement" | "event" | null;
  club_id?: string | null;
  event_topic?: string | null;
  event_sub_topic?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: AnnouncementFormData) => void;
  mode: "add" | "edit";
  defaultValues?: AnnouncementDefaultValues;
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

const toTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  const match = /^(\d{2}):(\d{2})/.exec(value);
  return match ? `${match[1]}:${match[2]}` : value;
};

function buildDefaults(
  defaultValues?: AnnouncementDefaultValues,
): AnnouncementFormData {
  const meta = (defaultValues?.metadata ?? {}) as {
    delivery?: string[];
    target?: string | string[];
  };
  const targetFromMeta =
    typeof meta.target === "string"
      ? [meta.target]
      : Array.isArray(meta.target)
        ? meta.target
        : [];

  return {
    type: defaultValues?.type ?? "announcement",
    title: defaultValues?.title ?? "",
    content: defaultValues?.content ?? "",
    deliveryOptions: meta.delivery ?? ["IN-APP"],
    targetAudience: defaultValues?.club_id ? "specific" : "all",
    selectedClubs: Array.from(
      new Set([
        ...targetFromMeta,
        ...(defaultValues?.club_id ? [defaultValues.club_id] : []),
      ]),
    ),
    event_topic: defaultValues?.event_topic ?? "",
    event_sub_topic: defaultValues?.event_sub_topic ?? "",
    event_date: toDateInputValue(defaultValues?.event_date),
    event_time: toTimeInputValue(defaultValues?.event_time),
    event_location: defaultValues?.event_location ?? "",
  };
}

export function AnnouncementModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
}: AnnouncementModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(defaultValues),
  });

  // react-hook-form's watch() is intentionally non-memoizable; safe in this controlled form.
  // eslint-disable-next-line react-hooks/incompatible-library
  const targetAudience = watch("targetAudience");
  const announcementType = watch("type") || "announcement";
  const deliveryOptions = watch("deliveryOptions") || [];
  const selectedClubs = watch("selectedClubs") || [];

  const { data: clubsData, isLoading: isLoadingClubs } =
    useQuery<PaginatedClubs>("/clubs?page_size=100", {
      enabled: open && targetAudience === "specific",
    });

  const availableClubs = filterAndNormalizeClubs(
    (clubsData?.clubs as unknown as Record<string, unknown>[]) || [],
  ).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (!open) return;
    reset(buildDefaults(defaultValues));
  }, [open, defaultValues, reset]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="mx-2 w-[calc(100%-1rem)] p-4 sm:mx-0 sm:max-w-xl sm:p-6">
        <ModalHeader
          className="pr-8"
          icon={<Megaphone className="h-5 w-5 text-gray-600" />}
          title={mode === "add" ? "Add New Announcement" : "Edit Announcement"}
          description={
            mode === "add"
              ? "Fill in your announcement details"
              : "Update your announcement details"
          }
        />
        <form
          onSubmit={handleSubmit(onSuccess)}
          noValidate
          className="space-y-5"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Type*</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-10">
              <Radio
                id="type-announcement"
                label="Announcement"
                value="announcement"
                checked={announcementType === "announcement"}
                onChange={() =>
                  setValue("type", "announcement", { shouldValidate: true })
                }
              />
              <Radio
                id="type-event"
                label="Event"
                value="event"
                checked={announcementType === "event"}
                onChange={() =>
                  setValue("type", "event", { shouldValidate: true })
                }
              />
            </div>
          </div>

          <FormField label="Title" required error={errors.title?.message}>
            <Input
              placeholder="Enter announcement title"
              {...register("title")}
            />
          </FormField>

          <FormField label="Message" required error={errors.content?.message}>
            <Textarea
              placeholder="Enter your message"
              rows={4}
              {...register("content")}
            />
          </FormField>

          {announcementType === "event" && (
            <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                Event Details
              </p>
              <FormField
                label="Event Topic"
                required
                error={errors.event_topic?.message}
              >
                <Input
                  placeholder="e.g. Friday Class"
                  {...register("event_topic")}
                />
              </FormField>

              <FormField
                label="Event Sub Topic"
                error={errors.event_sub_topic?.message}
              >
                <Input
                  placeholder="e.g. Intermediate Level"
                  {...register("event_sub_topic")}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Event Date"
                  required
                  error={errors.event_date?.message}
                >
                  <Input type="date" {...register("event_date")} />
                </FormField>
                <FormField
                  label="Event Time"
                  error={errors.event_time?.message}
                >
                  <Input type="time" {...register("event_time")} />
                </FormField>
              </div>

              <FormField
                label="Event Location"
                error={errors.event_location?.message}
              >
                <Input
                  placeholder="e.g. BGYCC Center, Ikeja"
                  {...register("event_location")}
                />
              </FormField>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">
              Delivery Options*
            </p>
            <div className="space-y-2">
              <Checkbox
                id="push"
                label="Send as push notification"
                checked={deliveryOptions.includes("PUSH")}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...deliveryOptions, "PUSH"]
                    : deliveryOptions.filter((d) => d !== "PUSH");
                  setValue("deliveryOptions", next, { shouldValidate: true });
                }}
              />
              <Checkbox
                id="in-app"
                label="Display inside the app"
                checked={deliveryOptions.includes("IN-APP")}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...deliveryOptions, "IN-APP"]
                    : deliveryOptions.filter((d) => d !== "IN-APP");
                  setValue("deliveryOptions", next, { shouldValidate: true });
                }}
              />
            </div>
            {errors.deliveryOptions && (
              <p className="text-xs text-error mt-1">
                {errors.deliveryOptions.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">
              Target Audience*
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-10">
              <Radio
                id="all"
                label="All Users"
                value="all"
                checked={targetAudience === "all"}
                onChange={() => setValue("targetAudience", "all")}
              />
              <Radio
                id="specific"
                label="Specific Clubs"
                value="specific"
                checked={targetAudience === "specific"}
                onChange={() => setValue("targetAudience", "specific")}
              />
            </div>
          </div>

          {targetAudience === "specific" && (
            <div className="space-y-3 p-4 rounded-2xl bg-background border border-border">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                Select Clubs*
              </p>
              <p className="text-[11px] text-slate-400 font-normal leading-snug">
                The announcement will be saved with the first selected club as
                its club scope.
              </p>

              {isLoadingClubs ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : availableClubs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableClubs.map((club) => (
                    <Checkbox
                      key={club.id}
                      id={club.id}
                      label={club.name}
                      checked={
                        selectedClubs.includes(club.id) ||
                        selectedClubs.includes(club.name)
                      }
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedClubs, club.id]
                          : selectedClubs.filter(
                              (val) => val !== club.id && val !== club.name,
                            );
                        setValue("selectedClubs", next, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No clubs available.
                </p>
              )}
            </div>
          )}

          <ModalFooter className="flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="min-h-11 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="min-h-11 flex-1"
            >
              {mode === "add"
                ? announcementType === "event"
                  ? "Create Event"
                  : "Send Announcement"
                : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
