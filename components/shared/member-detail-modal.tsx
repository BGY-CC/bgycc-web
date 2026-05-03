"use client";

import { Modal, ModalContent, Button, Badge, Skeleton } from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import { useQuery } from "@/hooks/use-query";
import { UserProfile } from "@/lib/services/profiles";
import { Mail, Shield, MapPin, Flame, Trophy, Activity, Clock, Search, X, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MemberDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberDetailModal({ userId, isOpen, onClose }: MemberDetailModalProps) {
  const { data, isLoading } = useQuery<{ profile: UserProfile }>(
    `/users/${userId}`,
    { enabled: !!userId && isOpen }
  );

  const profile = data?.profile;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent className="max-w-4xl p-0 overflow-hidden bg-gray-50/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        ) : !profile ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Member Not Found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-[280px]">
                We couldn't retrieve the details for this member.
              </p>
            </div>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header Section */}
            <div className="bg-white p-4 sm:p-8 border-b border-gray-100 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm shrink-0">
                  {profile.profile_picture_url ? (
                    <Image
                      src={profile.profile_picture_url}
                      alt={profile.full_name || "Profile"}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary text-3xl font-bold">
                      {(profile.full_name || profile.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">
                      {profile.full_name || profile.username || "Unknown User"}
                    </h2>
                    <Badge variant={profile.status === "active" ? "active" : "dormant"} className="rounded-full">
                      {profile.status || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500 overflow-hidden">
                    <div className="flex items-center gap-1.5 font-medium min-w-0">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="hidden sm:block h-4 w-px bg-gray-200" />
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-1.5 font-medium min-w-0">
                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Shield className="h-3 w-3" />
                      {profile.role || "Member"}
                    </div>
                    {profile.state && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <MapPin className="h-3 w-3" />
                        {profile.state}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Current Streak"
                  value={`${profile.status === 'at_risk' ? 0 : 7} days`}
                  icon={<Flame className="h-4 w-4" />}
                  color="#EF4444"
                />
                <StatCard
                  label="Longest Streak"
                  value="14 days"
                  icon={<Trophy className="h-4 w-4" />}
                  color="#F59E0B"
                />
                <StatCard
                  label="Activity Rate"
                  value="85%"
                  icon={<Activity className="h-4 w-4" />}
                  color="#10B981"
                />
                <StatCard
                  label="Last Active"
                  value={profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
                  icon={<Clock className="h-4 w-4" />}
                  color="#6366F1"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-4">
                {/* About Information */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm h-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                      About Member
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</p>
                        <p className="text-sm font-semibold text-gray-700">@{profile.username || "n/a"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined At</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          }) : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                        <p className="text-sm font-semibold text-gray-700 capitalize">{profile.gender || "Not specified"}</p>
                      </div>
                    </div>
                    {profile.bio && (
                      <div className="mt-8 pt-6 border-t border-gray-50 space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Bio</p>
                        <p className="text-sm text-gray-600 leading-relaxed italic font-medium">"{profile.bio}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Context */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Club Membership
                    </h3>
                    {profile.club_id ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                          C
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">Club Member</p>
                          <Link 
                            href={`/clubs/${profile.club_id}`}
                            className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tight"
                            onClick={onClose}
                          >
                            View Club Portal
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-gray-400 italic font-medium">No club assignment</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full justify-start text-xs font-bold" size="sm">
                        Send Message
                      </Button>
                      <Button variant="secondary" className="w-full justify-start text-xs font-bold" size="sm">
                        Reset Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs font-bold text-red-500 border-red-50 hover:bg-red-50" size="sm">
                        Deactivate Account
                      </Button>
                    </div>
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
