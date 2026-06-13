"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import { Button, FormField, Input, Skeleton, Textarea, useToast } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { useAuth } from "@/hooks/use-auth";
import { profilesService } from "@/lib/services/profiles";
import { isValidImageUrl, validateProfileImage } from "@/lib/profile-image";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string | null;
  profile_picture_url: string | null;
  role: string;
  role_assigned_at: string | null;
  created_at: string;
  permissions: string[];
}

type ProfileForm = Pick<ProfileData, "full_name" | "phone" | "bio" | "timezone" | "profile_picture_url">;

export function ProfileClient() {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const { data, isLoading, refetch } = useQuery<{ profile: ProfileData }>("/profiles/me");
  const profile = data?.profile;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { control, register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<ProfileForm>();
  const imageUrl = useWatch({ control, name: "profile_picture_url" });

  useEffect(() => {
    if (!profile) return;
    reset({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      timezone: profile.timezone ?? "",
      profile_picture_url: profile.profile_picture_url ?? "",
    });
  }, [profile, reset]);

  const save = async (values: ProfileForm) => {
    try {
      const result = await profilesService.updateMe({
        ...values,
        profile_picture_url: values.profile_picture_url?.trim() || undefined,
      }) as { success?: boolean; data?: { profile?: ProfileData }; error?: string };
      if (!result.success || !result.data?.profile) {
        toast(result.error || "Failed to update profile", "error");
        return;
      }
      updateUser({
        full_name: result.data.profile.full_name,
        profile_picture_url: result.data.profile.profile_picture_url,
      });
      refetch();
      toast("Profile updated successfully");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update profile", "error");
    }
  };

  const uploadProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validationError = validateProfileImage(file);
    if (validationError) {
      toast(validationError, "error");
      return;
    }

    setIsUploading(true);
    try {
      const result = await profilesService.uploadMyImage(file) as {
        success?: boolean;
        data?: { public_url?: string };
        error?: string;
      };
      if (!result.success || !result.data?.public_url) {
        toast(result.error || "Failed to upload profile image", "error");
        return;
      }
      setValue("profile_picture_url", result.data.public_url, { shouldDirty: true });
      toast("Image uploaded. Save your profile to apply it.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to upload profile image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !profile) {
    return <div className="mx-auto w-full max-w-5xl space-y-4 px-4 pb-8 sm:px-6"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary text-2xl font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          aria-label="Upload profile image"
        >
          {isValidImageUrl(imageUrl) ? <Image src={imageUrl!} alt="Profile preview" width={80} height={80} className="h-full w-full object-cover" unoptimized /> : initials(profile.full_name || profile.email)}
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="h-5 w-5" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadProfileImage} className="sr-only" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="mt-2 text-xs font-medium text-primary hover:underline disabled:opacity-60">
          {isUploading ? "Uploading image..." : "Click image to upload"}
        </button>
        <h2 className="mt-4 text-lg font-semibold text-primary">{profile.full_name || "Administrator"}</h2>
        <p className="mt-1 break-all text-sm text-muted">{profile.email}</p>
        <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm">
          <div className="flex items-center gap-2 text-gray-700"><ShieldCheck className="h-4 w-4 text-primary" /><span>{roleLabel(profile.role)}</span></div>
          <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-primary" /><span>Active account</span></div>
        </div>
        {profile.permissions.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Permissions</p>
            <div className="flex flex-wrap gap-2">{profile.permissions.map((permission) => <span key={permission} className="rounded-full bg-background px-2.5 py-1 text-xs text-primary">{permissionLabel(permission)}</span>)}</div>
          </div>
        )}
      </aside>

      <form onSubmit={handleSubmit(save)} className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3"><UserRound className="h-5 w-5 text-primary" /><div><h2 className="font-semibold text-primary">Profile details</h2><p className="text-sm text-muted">Update how your account appears in the control center.</p></div></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name"><Input {...register("full_name")} /></FormField>
          <FormField label="Email"><Input value={profile.email} disabled /></FormField>
          <FormField label="Phone"><Input {...register("phone")} /></FormField>
          <FormField label="Timezone"><Input placeholder="Africa/Lagos" {...register("timezone")} /></FormField>
          <div className="sm:col-span-2"><FormField label="Profile image URL" hint="Upload by clicking your profile image, or enter a valid image URL."><Input type="url" placeholder="https://example.com/profile.jpg" {...register("profile_picture_url")} /></FormField></div>
          <div className="sm:col-span-2"><FormField label="Bio"><Textarea rows={5} maxLength={500} {...register("bio")} /></FormField></div>
        </div>
        <div className="mt-6 flex justify-end"><Button type="submit" isLoading={isSubmitting}>Save profile</Button></div>
      </form>
    </div>
  );
}

function initials(value: string) { return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function roleLabel(role: string) { return role.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function permissionLabel(permission: string) { return permission.replace(".", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
