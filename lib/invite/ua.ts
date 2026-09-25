export type InvitePlatform = "ios" | "android" | "other";

const IOS_RE = /iphone|ipad|ipod/i;
const ANDROID_RE = /android/i;

export function resolveInvitePlatform(userAgent: string): InvitePlatform {
  if (IOS_RE.test(userAgent)) return "ios";
  if (ANDROID_RE.test(userAgent)) return "android";
  return "other";
}

export function formatInviteCode(code: string): string {
  const raw = code.trim().toUpperCase();
  if (raw.includes("-")) return raw;
  if (raw.length <= 5) return raw;
  const split = Math.ceil(raw.length / 2);
  return `${raw.slice(0, split)} ${raw.slice(split)}`;
}