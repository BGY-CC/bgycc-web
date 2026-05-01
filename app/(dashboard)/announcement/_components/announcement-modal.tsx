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
} from "@/components/ui";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Message is required"),
  deliveryOptions: z.array(z.string()).min(1, "Select at least one delivery option"),
  targetAudience: z.enum(["all", "specific"]),
  selectedClubs: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: FormData) => void;
  mode: "add" | "edit";
  defaultValues?: any;
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      deliveryOptions: defaultValues?.metadata?.delivery ?? ["IN-APP"],
      targetAudience: defaultValues?.club_id ? "specific" : "all",
      selectedClubs: defaultValues?.metadata?.target ? (Array.isArray(defaultValues.metadata.target) ? defaultValues.metadata.target : [defaultValues.metadata.target]) : [],
    },
  });

  const targetAudience = watch("targetAudience");
  const deliveryOptions = watch("deliveryOptions") || [];
  const selectedClubs = watch("selectedClubs") || [];

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          icon={<Megaphone className="h-5 w-5 text-gray-600" />}
          title={mode === "add" ? "Add New Announcement" : "Edit Announcement"}
          description={
             mode === "add" 
              ? "Fill in your announcement details"
              : "Update your announcement details"
          }
        />
        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-6">
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
             <div className="flex gap-10">
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
                <div className="grid grid-cols-2 gap-3">
                    {["Lagos Club", "Kano Club", "Owerri Club", "Uyo Club"].map(club => (
                        <Checkbox 
                            key={club}
                            id={club}
                            label={club}
                            checked={selectedClubs.includes(club)}
                            onChange={(e) => {
                                const next = e.target.checked
                                    ? [...selectedClubs, club]
                                    : selectedClubs.filter(c => c !== club);
                                setValue("selectedClubs", next);
                            }}
                        />
                    ))}
                </div>
            </div>
          )}

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {mode === "add" ? "Send Announcement" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
