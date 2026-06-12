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

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Message is required"),
  deliveryOptions: z.array(z.string()).min(1, "Select at least one delivery option"),
  targetAudience: z.enum(["all", "specific"]),
  selectedClubs: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

interface AnnouncementDefaultValues {
  title?: string | null;
  content?: string | null;
  club_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: FormData) => void;
  mode: "add" | "edit";
  defaultValues?: AnnouncementDefaultValues;
}

export function AnnouncementModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
}: AnnouncementModalProps) {
  const meta = (defaultValues?.metadata ?? {}) as {
    delivery?: string[];
    target?: string | string[];
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      deliveryOptions: meta.delivery ?? ["IN-APP"],
      targetAudience: defaultValues?.club_id ? "specific" : "all",
      selectedClubs: meta.target ? (Array.isArray(meta.target) ? meta.target : [meta.target]) : [],
    },
  });

  // react-hook-form's watch() is intentionally non-memoizable; safe in this controlled form.
  // eslint-disable-next-line react-hooks/incompatible-library
  const targetAudience = watch("targetAudience");
  const deliveryOptions = watch("deliveryOptions") || [];
  const selectedClubs = watch("selectedClubs") || [];

  const { data: clubsData, isLoading: isLoadingClubs } = useQuery<PaginatedClubs>(
    "/clubs?page_size=100",
    { enabled: open && targetAudience === "specific" }
  );

  const availableClubs = filterAndNormalizeClubs(
    (clubsData?.clubs as unknown as Record<string, unknown>[]) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

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
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-5">
          <FormField label="Title" required error={errors.title?.message}>
            <Input placeholder="Enter announcement title" {...register("title")} />
          </FormField>

          <FormField label="Message" required error={errors.content?.message}>
            <Textarea
              placeholder="Enter your message"
              rows={4}
              {...register("content")}
            />
          </FormField>

          <div className="space-y-3">
             <p className="text-sm font-semibold text-primary">Delivery Options*</p>
             <div className="space-y-2">
                <Checkbox 
                    id="push" 
                    label="Send as push notification" 
                    checked={deliveryOptions.includes("PUSH")}
                    onChange={(e) => {
                        const next = e.target.checked 
                            ? [...deliveryOptions, "PUSH"]
                            : deliveryOptions.filter(d => d !== "PUSH");
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
                            : deliveryOptions.filter(d => d !== "IN-APP");
                        setValue("deliveryOptions", next, { shouldValidate: true });
                    }}
                />
             </div>
             {errors.deliveryOptions && (
                 <p className="text-xs text-error mt-1">{errors.deliveryOptions.message}</p>
             )}
          </div>

          <div className="space-y-3">
             <p className="text-sm font-semibold text-primary">Target Audience*</p>
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
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Select Clubs*</p>
                
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
                      {availableClubs.map(club => (
                          <Checkbox 
                              key={club.id}
                              id={club.id}
                              label={club.name}
                              checked={selectedClubs.includes(club.id) || selectedClubs.includes(club.name)}
                              onChange={(e) => {
                                  const next = e.target.checked
                                      ? [...selectedClubs, club.id]
                                      : selectedClubs.filter(val => val !== club.id && val !== club.name);
                                  setValue("selectedClubs", next, { shouldValidate: true });
                              }}
                          />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No clubs available.</p>
                )}
            </div>
          )}

          <ModalFooter className="flex-col-reverse sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} className="min-h-11 flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="min-h-11 flex-1">
              {mode === "add" ? "Send Announcement" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
