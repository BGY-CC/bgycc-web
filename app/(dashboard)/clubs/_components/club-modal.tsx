"use client";

import { useEffect, useState } from "react";
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
import { UserSearchSelect } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";
import { Controller } from "react-hook-form";
import { UserProfile } from "@/lib/services/profiles";
import type { Club } from "./types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const clubSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  // Leader ID instead of name
  leaderId: z.string().optional(),
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
  clubId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClubModal({ open, onClose, onSuccess, mode, defaultValues, clubId }: ClubModalProps) {
  const { user } = useAuth();
  const [selectedUserObj, setSelectedUserObj] = useState<UserProfile | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      leaderId: defaultValues?.leaderId ?? "",
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
        leaderId: defaultValues?.leaderId ?? "",
        state: defaultValues?.state ?? "",
        city: defaultValues?.city ?? "",
        whatsappLink: defaultValues?.whatsappLink ?? "",
        description: defaultValues?.description ?? "",
      });
    } else {
      reset({ name: "", leaderId: "", state: "", city: "", whatsappLink: "", description: "" });
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

          {user?.role !== "leader" && (
            <div className="space-y-1">
              <Controller
                name="leaderId"
                control={control}
                render={({ field }) => (
                  <UserSearchSelect
                    label="Assign Leader"
                    placeholder="Search for a user or leader..."
                    value={field.value}
                    onChange={(id, userObj) => {
                      field.onChange(id);
                      setSelectedUserObj(userObj);
                    }}
                    error={errors.leaderId?.message}
                    disabled={mode === "edit" && !!defaultValues?.leaderId && field.value === defaultValues.leaderId}
                  />
                )}
              />
              {selectedUserObj?.club_id && selectedUserObj.club_id !== clubId && (
                <p className="text-xs text-error font-medium">
                  Warning: This user is already assigned to another club.
                </p>
              )}
              {mode === "edit" && !!defaultValues?.leaderId && watch("leaderId") === defaultValues.leaderId && (
                <p className="text-[10px] text-muted">
                  A leader must be unassigned before another can be set.{" "}
                  <button
                    type="button"
                    onClick={() => setValue("leaderId", "")}
                    className="text-primary hover:underline font-medium"
                  >
                    Unassign Current Leader
                  </button>
                </p>
              )}
            </div>
          )}

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
