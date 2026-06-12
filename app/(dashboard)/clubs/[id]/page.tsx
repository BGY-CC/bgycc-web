"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, TrendingUp, MessageCircle, Pencil, Trophy, AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Badge, Button, Skeleton, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton, PageHeader, MemberDetailModal } from "@/components/shared";
import { EngagementChart, MemberStatusChart } from "@/components/charts";
import { useQuery } from "@/hooks/use-query";
import { clubsService, Club } from "@/lib/services/clubs";
import { ClubModal } from "../_components/club-modal";
import { useParams } from "next/navigation";

const ENGAGEMENT_PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

function ClubDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs", href: "/clubs" }, { label: "Loading" }]}
      />

      <div className="flex-1 space-y-6 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="space-y-4">
          <Skeleton className="h-5 w-10" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-80 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-[340px] rounded-xl border border-gray-200 bg-white lg:col-span-2" />
          <Skeleton className="h-[340px] rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}

function MemberListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export default function ClubDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const clubId = Array.isArray(params.id) ? params.id[0] : params.id;
  const hasValidClubId = !!clubId && clubId !== "undefined";

  // Fetch data
  const { data: clubData, isLoading: isLoadingClub, refetch: refetchClub } = useQuery<{ club: Club & { leader?: { full_name?: string } } }>(
    `/clubs/${clubId}`,
    { enabled: hasValidClubId },
  );
  
  interface AtRiskMember {
    user_id: string;
    full_name?: string | null;
    current_streak?: number;
  }
  interface TopPerformer {
    user_id: string;
    full_name?: string | null;
    current_streak?: number;
    total_xp?: number;
  }
  interface Demographics {
    gender_distribution?: { male?: number; female?: number };
    age_distribution?: Record<string, number>;
    [key: string]: unknown;
  }

  const { data: healthData, isLoading: isLoadingHealth } = useQuery<{ demographics: Demographics; at_risk_members: AtRiskMember[] }>(
    `/clubs/${clubId}/member-health`,
    { enabled: hasValidClubId },
  );

  const [engagementPeriod, setEngagementPeriod] = useState("7d");
  const [engagementPeriodOpen, setEngagementPeriodOpen] = useState(false);
  const engagementPeriodRef = useRef<HTMLDivElement>(null);

  const [statusPeriod, setStatusPeriod] = useState("7d");
  const [statusPeriodOpen, setStatusPeriodOpen] = useState(false);
  const statusPeriodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!engagementPeriodOpen && !statusPeriodOpen) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const clickedEngagement = engagementPeriodRef.current?.contains(target) ?? false;
      const clickedStatus = statusPeriodRef.current?.contains(target) ?? false;

      if (!clickedEngagement && !clickedStatus) {
        setEngagementPeriodOpen(false);
        setStatusPeriodOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [engagementPeriodOpen, statusPeriodOpen]);

  const engagementPeriodLabel =
    ENGAGEMENT_PERIOD_OPTIONS.find((o) => o.value === engagementPeriod)?.label ??
    "Last 7 Days";

  const statusPeriodLabel =
    ENGAGEMENT_PERIOD_OPTIONS.find((o) => o.value === statusPeriod)?.label ??
    "Last 7 Days";

  const { data: engagementData } = useQuery<{ data: { date: string; reports: number; logins: number }[] }>(
    `/clubs/${clubId}/engagement?period=${engagementPeriod}`,
    { enabled: hasValidClubId },
  );

  const { data: statusData } = useQuery<{ data: { active: number; at_risk: number; inactive: number } }>(
    `/clubs/${clubId}/member-status?period=${statusPeriod}`,
    { enabled: hasValidClubId },
  );

  const { data: topPerformersData, isLoading: isLoadingTop } = useQuery<{ top_performers: TopPerformer[] }>(
    `/clubs/${clubId}/top-performers`,
    { enabled: hasValidClubId },
  );

  const club = clubData?.club;
  const health = healthData;
  const topPerformers = topPerformersData?.top_performers || [];
  const atRiskMembers = healthData?.at_risk_members || [];

  const handleEdit = async (formData: {
    name: string;
    state: string;
    city: string;
    description?: string;
    whatsappLink?: string;
  }) => {
    if (!club) return;
    try {
      const result = await clubsService.update(club.id, {
        name: formData.name,
        state: formData.state,
        city: formData.city,
        description: formData.description,
        url_link: formData.whatsappLink,
        country: "Nigeria", // default
      });

      if (result.success) {
        setShowEdit(false);
        toast("Club updated successfully");
        refetchClub();
      } else {
        toast(result.error || result.message || "Failed to update club", "error");
      }
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred while updating the club", "error");
    }
  };

  // Validate that the id is not undefined or invalid
  if (!hasValidClubId) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-primary mb-2">Invalid Club ID</h1>
          <p className="text-muted mb-6">The club ID is missing or invalid. Please go back and try again.</p>
          <Link href="/clubs" className="inline-block">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Clubs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingClub) {
    return <ClubDetailSkeleton />;
  }

  if (!club) {
    return <div className="p-8 text-center text-gray-500">Club not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]}
      />

      <div className="flex-1 space-y-6 px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">

      {/* Club header */}
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="text-2xl font-bold text-gray-900 break-words">{club.name}</h1>
            <Badge variant={club.is_active ? "active" : "dormant"} className="rounded-full px-3 py-1 whitespace-normal text-center">
              {club.is_active ? "Active" : "Dormant"}
            </Badge>
          </div>
          <p className="mt-1 break-words text-sm font-medium text-gray-400">
            {club.description || "Historic city, modern leadership approach."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          {club.url_link && (
            <Button
              variant="secondary"
              size="sm"
              className="h-10 w-full rounded-xl border-gray-200 px-4 font-semibold text-gray-700 sm:w-auto"
              leftIcon={<MessageCircle className="h-4 w-4" />}
              onClick={() => window.open(club.url_link, "_blank")}
            >
              WhatsApp
            </Button>
          )}
          <Button
            size="sm"
            className="h-10 w-full rounded-xl bg-[#1e293b] px-4 font-semibold text-white hover:bg-[#0f172a] sm:w-auto"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setShowEdit(true)}
          >
            Edit Club
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
            {club.leader?.profile_picture_url ? (
              <Image 
                src={club.leader.profile_picture_url} 
                alt={club.leader.full_name || "Leader"} 
                width={36} 
                height={36} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 font-medium text-base">
                {(club.leader?.full_name || "L").charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Leader</span>
            <span className="break-words text-xs font-medium text-gray-900">{club.leader?.full_name || "No Leader Assigned"}</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Region</span>
          <span className="break-words text-xs font-medium text-gray-900">
            {[club.city, club.state].filter(Boolean).join(", ") || "No Region Set"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created</span>
          <span className="text-xs font-medium text-gray-600">
            {club.created_at ? new Date(club.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }) : "N/A"}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={health?.demographics?.total?.toLocaleString() || club.total_members?.toLocaleString() || "0"} icon={<Users className="h-4 w-4" />} change={0} />
        <StatCard 
          label="Active Members" 
          value={health?.demographics?.active?.toLocaleString() || club.active_members?.toLocaleString() || "0"} 
          icon={<Activity className="h-4 w-4" />}
          change={0}
        />
        <StatCard label="At Risk Members" value={health?.demographics?.at_risk?.toLocaleString() || "0"} icon={<Users className="h-4 w-4 text-red-500" />} change={0} />
        <StatCard label="Avg Streak" value={`${club.average_streak?.toFixed(0) || "0"}%`} icon={<TrendingUp className="h-4 w-4" />} change={0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Engagement Trends</h3>
              <p className="text-[11px] font-medium text-gray-400">Reports & logins · {engagementPeriodLabel.toLowerCase()}</p>
            </div>
            <div ref={engagementPeriodRef} className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEngagementPeriodOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={engagementPeriodOpen}
                className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary sm:min-h-0 sm:w-auto sm:px-1 sm:py-0.5"
              >
                <span className="truncate">{engagementPeriodLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {engagementPeriodOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150 sm:left-auto sm:right-0 sm:min-w-[160px]"
                >
                  {ENGAGEMENT_PERIOD_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={engagementPeriod === opt.value}
                        onClick={() => {
                          setEngagementPeriod(opt.value);
                          setEngagementPeriodOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                          engagementPeriod === opt.value
                            ? "text-primary font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <EngagementChart
            data={engagementData?.data?.map(d => ({
              label: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
              reports: d.reports,
              active_users: d.logins
            }))}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Member Status</h3>
              <p className="text-[11px] font-medium text-gray-400">Risk distribution</p>
            </div>
            <div ref={statusPeriodRef} className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatusPeriodOpen((p) => !p)}
                className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary sm:min-h-0 sm:w-auto sm:px-1 sm:py-0.5"
              >
                <span className="truncate">{statusPeriodLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {statusPeriodOpen && (
                <ul className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150 sm:left-auto sm:right-0 sm:min-w-[160px]">
                  {ENGAGEMENT_PERIOD_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusPeriod(opt.value);
                          setStatusPeriodOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                          statusPeriod === opt.value ? "text-primary font-medium" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <MemberStatusChart 
            data={statusData?.data ? {
              active: statusData.data.active,
              at_risk: statusData.data.at_risk,
              reset: statusData.data.inactive,
              total: statusData.data.active + statusData.data.at_risk + statusData.data.inactive
            } : undefined} 
          />
        </div>
      </div>

      {/* Top performers + At-risk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Performers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
              <Trophy className="h-4 w-4 text-gray-400" />
            </div>
            Top Performers
          </h3>
          <div className="space-y-3">
            {isLoadingTop ? (
               <MemberListSkeleton />
            ) : topPerformers.length === 0 ? (
               <div className="text-sm text-gray-500">No top performers found.</div>
            ) : (
              topPerformers.map((p, i: number) => (
                <button
                  type="button"
                  key={i} 
                  className="group flex min-h-11 w-full flex-col gap-2 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => {
                    setSelectedMemberId(p.user_id);
                    setShowMemberDetail(true);
                  }}
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 transition-colors">
                      {(p.full_name || "U").charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">{p.full_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400 font-medium">Streak: {p.current_streak} days</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-success">
                    {Math.min(99, Math.round((p.total_xp || 0) / 10))}%
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* At-Risk Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            At-Risk Members
          </h3>
          <div className="space-y-3">
            {isLoadingHealth ? (
               <MemberListSkeleton />
            ) : atRiskMembers.length === 0 ? (
               <div className="text-sm text-gray-500">No at-risk members found.</div>
            ) : (
              atRiskMembers.map((m, i: number) => (
                <button
                  type="button"
                  key={i} 
                  className="group flex min-h-11 w-full flex-col gap-2 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => {
                    setSelectedMemberId(m.user_id);
                    setShowMemberDetail(true);
                  }}
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 transition-colors">
                      {(m.full_name || "U").charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">{m.full_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400 font-medium">{m.current_streak === 0 ? "Broken streak" : "Low activity"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-red-500">
                    {m.current_streak === 0 ? "Broken streak" : "Low activity"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      </div>

      <MemberDetailModal
        isOpen={showMemberDetail}
        onClose={() => setShowMemberDetail(false)}
        userId={selectedMemberId}
      />
      <ClubModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={handleEdit}
        mode="edit"
        defaultValues={{
          name: club.name,
          leaderId: club.leader?.id || "",
          state: club.state,
          city: club.city,
          description: club.description,
          whatsappLink: club.url_link,
        }}
      />
    </div>
  );
}
