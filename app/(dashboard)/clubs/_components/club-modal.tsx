"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users } from "lucide-react";
// @ts-ignore – no types bundled
import { getStates, getLgas } from "nigeria-state-lga-data";
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
import type { Club } from "./types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const clubSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  // Leader is optional — can be assigned later
  leader: z.string().optional(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City / LGA is required"),
  whatsappLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https:\/\/chat\.whatsapp\.com\//.test(val),
      { message: "Must be a valid WhatsApp group link (https://chat.whatsapp.com/...)" },
    ),
  description: z.string().optional(),
});

type ClubFormData = z.infer<typeof clubSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClubModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: ClubFormData) => void;
  mode: "create" | "edit";
  defaultValues?: Partial<ClubFormData>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClubModal({ open, onClose, onSuccess, mode, defaultValues }: ClubModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      leader: defaultValues?.leader ?? "",
      state: defaultValues?.state ?? "",
      city: defaultValues?.city ?? "",
      whatsappLink: defaultValues?.whatsappLink ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const selectedState = watch("state");
  const allStates: string[] = getStates();
  const cities: string[] = selectedState ? getLgas(selectedState) : [];

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name ?? "",
        leader: defaultValues?.leader ?? "",
        state: defaultValues?.state ?? "",
        city: defaultValues?.city ?? "",
        whatsappLink: defaultValues?.whatsappLink ?? "",
        description: defaultValues?.description ?? "",
      });
    } else {
      reset({ name: "", leader: "", state: "", city: "", whatsappLink: "", description: "" });
    }
  }, [open, reset, defaultValues]);

  const isCreate = mode === "create";

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader
          icon={<Users className="h-5 w-5 text-gray-600" />}
          title={isCreate ? "Create New Club" : "Edit Club"}
          description={
            isCreate ? "This is a platform to encourage discipline" : "Make changes to the club"
          }
        />

        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4">
          <FormField label="Club Name" required error={errors.name?.message}>
            <Input placeholder="What is your club name?" {...register("name")} />
          </FormField>

          <FormField label="Assign Leader" error={errors.leader?.message}>
            <Input placeholder="Search Leader Name (optional)" {...register("leader")} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="State" required error={errors.state?.message}>
              <Select {...register("state")}>
                <option value="">Select State</option>
                {allStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="City / LGA" required error={errors.city?.message}>
              <Select {...register("city")} disabled={!selectedState}>
                <option value="">{selectedState ? "Select City" : "Select state first"}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="WhatsApp Link" error={errors.whatsappLink?.message}>
            <Input placeholder="https://chat.whatsapp.com/..." {...register("whatsappLink")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea placeholder="Club Description..." rows={3} {...register("description")} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {isCreate ? "Create Club" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
