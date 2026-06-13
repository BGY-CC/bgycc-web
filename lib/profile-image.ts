export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateProfileImage(file: File) {
  if (!PROFILE_IMAGE_TYPES.includes(file.type)) return "Select a JPEG, PNG, or WebP image";
  if (file.size > PROFILE_IMAGE_MAX_BYTES) return "Profile image must be 2MB or smaller";
  return null;
}

export function isValidImageUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
