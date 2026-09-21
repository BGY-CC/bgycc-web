"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { familiesService, type FamilyStats } from "@/lib/services/families";
import { FamilyStatsPanel } from "../_components/family-stats-panel";
import { FamilyActions } from "../_components/family-actions";

export default function FamilyDetailPage() {
  const params = useParams();
  const familyId = Array.isArray(params.familyId) ? params.familyId[0] : params.familyId;
  const hasValidFamilyId = !!familyId && familyId !== "undefined";

  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [isLoading, setIsLoading] = useState(hasValidFamilyId);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!hasValidFamilyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await familiesService.getStats(familyId);
      const data = (res as { success?: boolean; data?: FamilyStats }).data;
      if (res.success && data) {
        setStats(data);
      } else {
        setError(new Error((res as { error?: string; message?: string }).error || "Family not found"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [familyId, hasValidFamilyId]);

  // Initial load on mount / familyId change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStats();
  }, [fetchStats]);

  if (!hasValidFamilyId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[400px]">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-primary">Invalid Family ID</h1>
          <p className="mb-6 text-muted">The family ID is missing or invalid. Please go back and try again.</p>
          <Link href="/clubs" className="inline-block">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Clubs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Family Overview"
        breadcrumb={[{ label: "Clubs", href: "/clubs" }, { label: familyId }]}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Home className="h-3.5 w-3.5" />
          Family head: <span className="font-mono text-gray-600">{familyId}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 space-y-6 xl:col-span-2">
            <FamilyStatsPanel
              stats={stats}
              isLoading={isLoading}
              error={error}
              onRetry={() => void fetchStats()}
            />
          </div>

          <div className="min-w-0">
            <FamilyActions
              familyId={familyId}
              members={stats?.children ?? []}
              onChanged={() => void fetchStats()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}