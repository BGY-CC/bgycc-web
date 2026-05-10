"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, X } from "lucide-react";
// @ts-expect-error – no types bundled
import { getStates, getLgas } from "nigeria-state-lga-data";
import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { UserSearchSelect } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const clubSchema = z.object({
  name: z.string().min(1, "Club name is required"),
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

// ─── Drag-to-close hook ───────────────────────────────────────────────────────

const DISMISS_THRESHOLD = 80; // px dragged down before snap-close

function useDragToClose(onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only trigger from the handle / header area — ignore form inputs
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (["input", "select", "textarea", "button", "a", "label"].includes(tag)) return;
    isDragging.current = true;
    startY.current = e.clientY;
    sheetRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = Math.max(0, e.clientY - startY.current);
    setDragY(delta);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY >= DISMISS_THRESHOLD) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  }, [dragY, onClose]);

  return { sheetRef, dragY, onPointerDown, onPointerMove, onPointerUp };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClubModal({
  open,
  onClose,
  onSuccess,
  mode,
  defaultValues,
  clubId,
}: ClubModalProps) {
  const { user } = useAuth();
  const [selectedUserObj, setSelectedUserObj] = useState<UserProfile | null>(null);
  const { sheetRef, dragY, onPointerDown, onPointerMove, onPointerUp } =
    useDragToClose(onClose);

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedState = watch("state");
  const allStates: string[] = getStates();
  const cities: string[] = useMemo(
    () => (selectedState ? getLgas(selectedState) : []),
    [selectedState],
  );

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

  useEffect(() => {
    if (open && defaultValues?.city && cities.includes(defaultValues.city)) {
      setValue("city", defaultValues.city);
    }
  }, [cities, defaultValues?.city, setValue, open]);

  // Lock scroll & close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isCreate = mode === "create";

  // Snap-back transition only when not actively dragging
  const sheetStyle: React.CSSProperties = {
    transform: `translateY(${dragY}px)`,
    transition: dragY === 0 ? "transform 0.3s cubic-bezier(0.32,0.72,0,1)" : "none",
    willChange: "transform",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ opacity: Math.max(0, 1 - dragY / 300) }}
      />

      {/* Panel container — bottom-anchored on mobile, centred on sm+ */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? "Create club" : "Edit club"}
        onClick={onClose}
      >
        {/* Sheet */}
        <div
          ref={sheetRef}
          className={cn(
            "relative w-full bg-white shadow-xl overflow-hidden",
            // Mobile: full-width sheet
            "rounded-t-3xl max-h-[92dvh]",
            // sm+: floating card
            "sm:rounded-2xl sm:max-w-lg sm:max-h-[90vh]",
          )}
          style={sheetStyle}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden select-none">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[inherit] px-5 pt-3 pb-6">
            {/* Header */}
            <div className="mb-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                {isCreate ? "Create Club" : "Edit Club"}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {isCreate ? "Set up a new club on the platform" : "Update club details"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-4">
              <FormField label="Club Name" required error={errors.name?.message}>
                <Input placeholder="Club name" {...register("name")} />
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
                        disabled={
                          mode === "edit" &&
                          !!defaultValues?.leaderId &&
                          field.value === defaultValues.leaderId
                        }
                      />
                    )}
                  />
                  {selectedUserObj?.club_id && selectedUserObj.club_id !== clubId && (
                    <p className="text-xs text-error font-medium">
                      Warning: This user is already assigned to another club.
                    </p>
                  )}
                  {mode === "edit" &&
                    !!defaultValues?.leaderId &&
                    watch("leaderId") === defaultValues.leaderId && (
                      <p className="text-[10px] text-muted">
                        A leader must be unassigned before another can be set.{" "}
                        <button
                          type="button"
                          onClick={() => setValue("leaderId", "")}
                          className="text-primary hover:underline font-medium"
                        >
                          Unassign
                        </button>
                      </p>
                    )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField label="State" required error={errors.state?.message}>
                  <Select {...register("state")}>
                    <option value="">Select State</option>
                    {allStates.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="City / LGA" required error={errors.city?.message}>
                  <Select {...register("city")} disabled={!selectedState}>
                    <option value="">{selectedState ? "Select City" : "Pick state first"}</option>
                    {cities.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="WhatsApp Link" error={errors.whatsappLink?.message}>
                <Input placeholder="https://chat.whatsapp.com/..." {...register("whatsappLink")} />
              </FormField>

              <FormField label="Description" error={errors.description?.message}>
                <Textarea placeholder="Club description..." rows={3} {...register("description")} />
              </FormField>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  {isCreate ? "Create" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
