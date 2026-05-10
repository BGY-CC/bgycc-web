"use client";

import { Modal, ModalContent, Badge, Skeleton, Button } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { UserProfile } from "@/lib/services/profiles";
import {
  Mail,
  Shield,
  MapPin,
  Flame,
  Trophy,
  Activity,
  Clock,
  Search,
  X,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MemberDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-700">{value || "—"}</span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 px-2 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div
        className="h-8 w-8 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {icon}
      </div>
      <span className="text-[13px] font-bold text-gray-900 leading-none">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-[72px] rounded-2xl shrink-0" />
        ))}
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MemberDetailModal({
  userId,
  isOpen,
  onClose,
}: MemberDetailModalProps) {
  const { data, isLoading, error } = useQuery<{ profile: UserProfile }>(
    `/users/${userId}`,
    { enabled: !!userId && isOpen }
  );

  const profile = data?.profile;

  return (
    <Modal open={isOpen} onClose={onClose}>
      {/*
       * On mobile  → full-width, anchored to the bottom (sheet).
       * On md+     → centred panel, max-w-2xl.
       * We override ModalContent's default max-w-md via className.
       */}
      <ModalContent
        className={cn(
          "p-0 overflow-hidden bg-gray-50",
          // Mobile: stretch to full width, push to bottom of the flex container
          "self-end w-full rounded-t-3xl rounded-b-none max-h-[92dvh]",
          // md+: centre as normal panel
          "md:self-center md:rounded-2xl md:max-w-2xl md:max-h-[88vh]"
        )}
      >
        {/* Drag handle (visual only, mobile UX cue) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-gray-600 shadow-sm transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Content states ─────────────────────────────────────────────── */}

        {isLoading ? (
          <LoadingSkeleton />
        ) : !profile || error ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              {error ? (
                <Shield className="h-7 w-7" />
              ) : (
                <Search className="h-7 w-7" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {error ? "Access Denied" : "Member Not Found"}
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-[260px]">
                {error
                  ? (error instanceof Error ? error.message : null) ||
                    "You don't have permission to view this member."
                  : "We couldn't retrieve details for this member."}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden max-h-[inherit]">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-white px-5 pt-4 pb-5 border-b border-gray-100">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
                  {profile.profile_picture_url ? (
                    <Image
                      src={profile.profile_picture_url}
                      alt={profile.full_name || "Profile"}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/8 text-primary text-2xl font-bold">
                      {(
                        profile.full_name ||
                        profile.username ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {profile.full_name || profile.username || "Unknown User"}
                    </h2>
                    <Badge
                      variant={
                        profile.status === "active" ? "active" : "dormant"
                      }
                      className="rounded-full shrink-0"
                    >
                      {profile.status || "Unknown"}
                    </Badge>
                  </div>

                  {/* Contact row */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {profile.phone}
                      </span>
                    )}
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                      <Shield className="h-3 w-3" />
                      {profile.role || "Member"}
                    </span>
                    {profile.state && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                        <MapPin className="h-3 w-3" />
                        {profile.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ─────────────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
              {/* Stat grid — 4 equal columns */}
              <div className="grid grid-cols-4 gap-2">
                <MiniStat
                  icon={<Flame className="h-4 w-4" />}
                  label="Streak"
                  value={`${profile.status === "at_risk" ? 0 : 7}d`}
                  color="#EF4444"
                />
                <MiniStat
                  icon={<Trophy className="h-4 w-4" />}
                  label="Best"
                  value="14d"
                  color="#F59E0B"
                />
                <MiniStat
                  icon={<Activity className="h-4 w-4" />}
                  label="Activity"
                  value="85%"
                  color="#10B981"
                />
                <MiniStat
                  icon={<Clock className="h-4 w-4" />}
                  label="Last Active"
                  value={
                    profile.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : "N/A"
                  }
                  color="#6366F1"
                />
              </div>

              {/* About card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  About
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
                  <InfoRow label="Username" value={`@${profile.username || "n/a"}`} />
                  <InfoRow
                    label="Joined"
                    value={
                      profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Gender"
                    value={
                      profile.gender ? (
                        <span className="capitalize">{profile.gender}</span>
                      ) : undefined
                    }
                  />
                </div>

                {profile.bio && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Bio
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      &quot;{profile.bio}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Club + Actions row — stacked on mobile, side-by-side on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Club membership */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Club
                  </h3>
                  {profile.club_id ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        C
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">
                          Club Member
                        </p>
                        <Link
                          href={`/clubs/${profile.club_id}`}
                          className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tight"
                          onClick={onClose}
                        >
                          View Club →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No club assignment
                    </p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs font-bold"
                      size="sm"
                    >
                      Send Message
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs font-bold"
                      size="sm"
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-xs font-bold text-red-500 border-red-100 hover:bg-red-50"
                      size="sm"
                    >
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
