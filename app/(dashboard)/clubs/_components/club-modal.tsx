"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users } from "lucide-react";
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
  leader: z.string().min(1, "Leader is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  // Optional field — URL validation will be enforced server-side
  whatsappLink: z.string().optional(),
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

export function ClubModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
}: ClubModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      leader: defaultValues?.leader ?? "",
      state: "",
      city: "",
      whatsappLink: defaultValues?.whatsappLink ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name ?? "",
        leader: defaultValues?.leader ?? "",
        state: defaultValues?.state?.toLowerCase() ?? "",
        city: defaultValues?.city?.toLowerCase() ?? "",
        whatsappLink: defaultValues?.whatsappLink ?? "",
        description: defaultValues?.description ?? "",
      });
    } else {
      reset({
        name: "",
        leader: "",
        state: "",
        city: "",
        whatsappLink: "",
        description: "",
      });
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
            isCreate
              ? "This is a platform to encourage discipline"
              : "Make changes to the club"
          }
        />

        <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4">
          <FormField label="Club Name" required error={errors.name?.message}>
            <Input
              placeholder="What is your title?"
              {...register("name")}
            />
          </FormField>

          <FormField label="Assign Leader" required error={errors.leader?.message}>
            <Input placeholder="Search Leader Name" {...register("leader")} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="State" required error={errors.state?.message}>
              <Select {...register("state")}>
                <option value="">Select State</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">FCT Abuja</option>
                <option value="edo">Edo</option>
                <option value="oyo">Oyo</option>
                <option value="delta">Delta</option>
                <option value="anambra">Anambra</option>
                <option value="kano">Kano</option>
                <option value="plateau">Plateau</option>
                <option value="niger">Niger</option>
              </Select>
            </FormField>

            <FormField label="City" required error={errors.city?.message}>
              <Select {...register("city")}>
                <option value="">Select City</option>
                <option value="ikeja">Ikeja</option>
                <option value="ibadan">Ibadan</option>
                <option value="benin">Benin City</option>
                <option value="warri">Warri</option>
                <option value="kano">Kano</option>
                <option value="jos">Jos</option>
                <option value="minna">Minna</option>
                <option value="onitsha">Onitsha</option>
              </Select>
            </FormField>
          </div>

          <FormField label="WhatsApp Link" error={errors.whatsappLink?.message}>
            <Input
              placeholder="https://chat.whatsapp.com/.."
              {...register("whatsappLink")}
            />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="Club Description..."
              rows={3}
              {...register("description")}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
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
