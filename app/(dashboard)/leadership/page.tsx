"use client";

import { PageHeader } from "@/components/shared";
import { PendingApprovals } from "./_components/pending-approvals";
import { PromotionsFeed } from "./_components/promotions-feed";
import { RankDistribution } from "./_components/rank-distribution";
import { WeeklyCelebrations } from "./_components/weekly-celebrations";

export default function LeadershipPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Leadership & Promotions"
        breadcrumb={[{ label: "Leadership" }]}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Pending approvals + rank spread */}
          <div className="min-w-0 space-y-6 xl:col-span-2">
            <PendingApprovals />
            <RankDistribution />
            <PromotionsFeed />
          </div>

          {/* Weekly celebrations feed */}
          <div className="min-w-0">
            <WeeklyCelebrations />
          </div>
        </div>
      </div>
    </div>
  );
}