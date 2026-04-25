"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, TrendingUp, MessageCircle, Pencil } from "lucide-react";
import { Badge, Button, useToast } from "@/components/ui";
import { StatCard, PageHeader } from "@/components/shared";
import { EngagementChart, MemberStatusChart } from "@/components/charts";
import { useQuery } from "@/hooks/use-query";
import { clubsService, Club } from "@/lib/services/clubs";
import { ClubModal } from "../_components/club-modal";
import { useParams } from "next/navigation";

export default function ClubDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);

  // Validate that the id is not undefined or invalid
  if (!params.id || params.id === "undefined") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Invalid Club ID</h1>
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

  // Fetch data
  const { data: clubData, isLoading: isLoadingClub, refetch: refetchClub } = useQuery<{ club: Club & { leader?: { full_name?: string } } }>(
    `/clubs/${params.id}`
  );
  
  const { data: healthData, isLoading: isLoadingHealth } = useQuery<{ demographics: any; at_risk_members: any[] }>(
    `/clubs/${params.id}/member-health`
  );
  
  const { data: topPerformersData, isLoading: isLoadingTop } = useQuery<{ top_performers: any[] }>(
    `/clubs/${params.id}/top-performers`
  );

  const club = clubData?.club;
  const health = healthData;
  const topPerformers = topPerformersData?.top_performers || [];
  const atRiskMembers = healthData?.at_risk_members || [];

  const handleEdit = async (formData: any) => {
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
        alert(result.error || result.message || "Failed to update club");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred while updating the club");
    }
  };

  if (isLoadingClub) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!club) {
    return <div className="p-8 text-center text-gray-500">Club not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]}
      />

      {/* Club header */}
      <div>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{club.name}</h2>
              <Badge variant={club.is_active ? "active" : "dormant"}>
                {club.is_active ? "Active" : "Dormant"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{club.description || "Holistic city, modern leadership approach"}</p>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {club.leader?.full_name?.charAt(0) || "L"}
                </span>
                <span className="font-medium text-gray-700">{club.leader?.full_name || "No Leader"}</span>
                <span className="text-gray-400 text-xs">Leader</span>
              </span>
              <span>{[club.city, club.state].filter(Boolean).join(", ") || "Unknown"} <span className="text-gray-400 text-xs ml-1">Region</span></span>
              {club.created_at && (
                <span>{new Date(club.created_at).toLocaleDateString()} <span className="text-gray-400 text-xs ml-1">Created</span></span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {club.url_link && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle className="h-4 w-4" />}
                onClick={() => window.open(club.url_link, "_blank")}
              >
                WhatsApp
              </Button>
            )}
            <Button
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setShowEdit(true)}
            >
              Edit Club
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={health?.demographics?.total?.toString() || club.total_members?.toString() || "0"} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Members" value={health?.demographics?.active?.toString() || club.active_members?.toString() || "0"} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="At Risk Members" value={health?.demographics?.at_risk?.toString() || "0"} icon={<Users className="h-4 w-4 text-red-500" />} />
        <StatCard label="Avg Streak" value={club.average_streak?.toFixed(1) || "0.0"} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Engagement Trends</h3>
              <p className="text-xs text-gray-500">Reports &amp; logins this week</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <EngagementChart />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Member Status</h3>
            <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>This Week</option>
            </select>
          </div>
          <MemberStatusChart />
        </div>
      </div>

      {/* Top performers + At-risk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Performers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {isLoadingTop ? (
               <div className="text-sm text-gray-500">Loading...</div>
            ) : topPerformers.length === 0 ? (
               <div className="text-sm text-gray-500">No top performers found.</div>
            ) : (
               topPerformers.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                    {(p.full_name || "U").charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">Streak: {p.current_streak} days</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{p.total_xp} XP</span>
              </div>
            )))}
          </div>
        </div>

        {/* At-Risk Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            At-Risk Members
          </h3>
          <div className="space-y-3">
            {isLoadingHealth ? (
               <div className="text-sm text-gray-500">Loading...</div>
            ) : atRiskMembers.length === 0 ? (
               <div className="text-sm text-gray-500">No at-risk members found.</div>
            ) : (
              atRiskMembers.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                    {(m.full_name || "U").charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">Broken streak</p>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline font-medium">
                  View
                </button>
              </div>
            )))}
          </div>
        </div>
      </div>

      <ClubModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={handleEdit}
        mode="edit"
        defaultValues={{
          name: club.name,
          leader: club.leader?.full_name || "",
          state: club.state,
          city: club.city,
          description: club.description,
          whatsappLink: club.url_link,
        }}
      />
    </div>
  );
}
