"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Printer,
  UserPlus,
  CheckCircle2,
  Siren,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button, Select, useToast } from "@/components/ui";
import { StatCard, StatCardSkeleton } from "@/components/shared";
import {
  analyticsService,
  FunnelRow,
  FunnelQueryParams,
  EscalationData,
  PredictiveAtRiskData,
  FaithfulParentSignal,
} from "@/lib/services/analytics";
import { clubsService } from "@/lib/services/clubs";
// @ts-expect-error – no types bundled
import { getStates } from "nigeria-state-lga-data";

const PERIOD_OPTIONS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]["value"];

const ROLE_OPTIONS = ["member", "leader", "admin", "parent"] as const;

interface FunnelFilters {
  clubId: string;
  region: string;
  role: string;
}

const EMPTY_FILTERS: FunnelFilters = { clubId: "", region: "", role: "" };

export function AnalyticsClient() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("month");
  const [exporting, setExporting] = useState(false);
  const [funnelExporting, setFunnelExporting] = useState(false);
  const [rows, setRows] = useState<FunnelRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FunnelFilters>(EMPTY_FILTERS);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [escalations, setEscalations] = useState<EscalationData | null>(null);
  const [predictive, setPredictive] = useState<PredictiveAtRiskData | null>(
    null,
  );
  const [faithfulParents, setFaithfulParents] = useState<
    FaithfulParentSignal[] | null
  >(null);
  const [auxError, setAuxError] = useState<string | null>(null);

  const activeParams = useMemo(() => {
    const params: FunnelQueryParams = {};
    if (filters.clubId) params.clubId = filters.clubId;
    if (filters.region) params.region = filters.region;
    if (filters.role) params.role = filters.role;
    return params;
  }, [filters]);

  const hasFilters = Object.keys(activeParams).length > 0;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setIsRefreshing(true);
    analyticsService
      .getFunnelCsv(activeParams)
      .then((res) => {
        if (!cancelled) setRows(res.rows);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load funnel");
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeParams]);

  useEffect(() => {
    clubsService
      .list({ page_size: 1000 })
      .then((res) => {
        const data = (
          res as
            | { data?: { clubs?: Array<{ id: string; name: string }> } }
            | undefined
        )?.data;
        setClubs(data?.clubs ?? []);
      })
      .catch(() => setClubs([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuxError(null);
    analyticsService
      .getEscalations(30)
      .then((data) => {
        if (!cancelled) setEscalations(data as EscalationData);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setAuxError(
            e instanceof Error ? e.message : "Failed to load escalations",
          );
      });
    analyticsService
      .getPredictiveAtRisk(7)
      .then((data) => {
        if (!cancelled) setPredictive(data as PredictiveAtRiskData);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setAuxError(
            e instanceof Error
              ? e.message
              : "Failed to load predictive at-risk",
          );
      });
    analyticsService
      .getFaithfulParents()
      .then((data) => {
        if (!cancelled) setFaithfulParents(data.parents);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setAuxError(
            e instanceof Error ? e.message : "Failed to load faithful parents",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateFilter = (key: keyof FunnelFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => setFilters(EMPTY_FILTERS);

  const handlePrint = () => window.print();

  const funnel = rows ?? [];
  const started = funnel.length > 0 ? funnel[0].started : 0;
  const completeRow = funnel.filter((r) => r.step === "complete").pop();
  const completed = completeRow?.completed ?? 0;
  const conversion = started > 0 ? Math.round((completed / started) * 100) : 0;
  const maxStarted = Math.max(...funnel.map((r) => r.started), 1);

  const clubLabel =
    clubs.find((c) => c.id === filters.clubId)?.name ?? filters.clubId;
  const allStates: string[] = getStates();
  const filterSummary = [
    filters.clubId ? `Club: ${clubLabel}` : "All clubs",
    filters.region ? `Region: ${filters.region}` : "All regions",
    filters.role ? `Role: ${filters.role}` : "All roles",
  ].join(" · ");

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await analyticsService.exportCsv(period);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${period}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("CSV export downloaded", "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleFunnelExport = async () => {
    setFunnelExporting(true);
    try {
      const { csv } = await analyticsService.getFunnelCsv(activeParams);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `onboarding-funnel.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("Funnel CSV downloaded", "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Funnel export failed", "error");
    } finally {
      setFunnelExporting(false);
    }
  };

  if (rows === null && !error) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-48 rounded bg-gray-100" />
              <div className="mt-4 h-8 w-full rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Attendees Started"
          value={started}
          icon={<UserPlus className="h-5 w-5 text-primary" />}
          description="Onboarding funnel entry"
        />
        <StatCard
          label="Attendees Completed"
          value={completed}
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          description={`${conversion}% conversion`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Club</span>
          <Select
            aria-label="Club"
            value={filters.clubId}
            onChange={(e) => updateFilter("clubId", e.target.value)}
            disabled={isRefreshing}
            className="w-44"
          >
            <option value="">All clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Region</span>
          <Select
            aria-label="Region"
            value={filters.region}
            onChange={(e) => updateFilter("region", e.target.value)}
            disabled={isRefreshing}
            className="w-44"
          >
            <option value="">All regions</option>
            {allStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Role</span>
          <Select
            aria-label="Role"
            value={filters.role}
            onChange={(e) => updateFilter("role", e.target.value)}
            disabled={isRefreshing}
            className="w-44"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </label>
        {hasFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            disabled={isRefreshing}
          >
            Clear filters
          </Button>
        )}
        {isRefreshing && (
          <span className="ml-auto text-xs text-gray-500" role="status">
            Updating funnel…
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleFunnelExport}
            disabled={funnelExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {funnelExporting ? "Exporting…" : "Download Funnel"}
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print / PDF
          </Button>
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {auxError && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-700">
          {auxError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EscalationsCard escalations={escalations} />
        <PredictiveAtRiskCard predictive={predictive} />
      </div>

      <FaithfulParentsCard
        parents={faithfulParents}
        onAwarded={setFaithfulParents}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="hidden px-5 pt-5 print:block">
          <h2 className="text-sm font-semibold text-gray-900">
            Onboarding Funnel
          </h2>
          <p className="mt-1 text-xs text-gray-500">{filterSummary}</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Funnel Step</th>
              <th className="px-5 py-3 font-medium">Started</th>
              <th className="px-5 py-3 font-medium">Completed</th>
              <th className="px-5 py-3 font-medium">Drop-off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {funnel.map((row) => (
              <tr key={row.step}>
                <td className="px-5 py-3 text-gray-900">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="h-2 rounded-full bg-primary/80"
                      style={{
                        width: Math.max(
                          8,
                          Math.round((row.started / maxStarted) * 120),
                        ),
                      }}
                    />
                    <span>{row.step}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{row.started}</td>
                <td className="px-5 py-3 text-gray-600">{row.completed}</td>
                <td className="px-5 py-3 text-amber-600">{row.dropRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EscalationsCard({
  escalations,
}: {
  escalations: EscalationData | null;
}) {
  const summary = escalations?.summary;
  const maxTrend = Math.max(
    ...(escalations?.trend ?? []).map((t) => t.total),
    1,
  );
  const byRule = summary?.by_rule ?? [];

  return (
    <section
      aria-label="Escalations (30d)"
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Siren className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Escalations (30d)
        </h3>
      </div>
      {!summary ? (
        <p className="text-sm text-gray-400">Loading escalation summary…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">
                <span className="tabular-nums">{summary.total}</span>
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700 tabular-nums">
                {summary.by_severity.yellow}
              </p>
              <p className="text-xs text-amber-600">Yellow</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-600 tabular-nums">
                {summary.by_severity.red}
              </p>
              <p className="text-xs text-red-500">Red</p>
            </div>
          </div>

          <div className="mb-4 flex items-end gap-1">
            {(escalations?.trend ?? []).map((entry) => (
              <div
                key={entry.date}
                title={`${entry.date}: ${entry.total}`}
                className="w-full rounded-t bg-amber-200/70"
                style={{
                  height: `${Math.max(4, Math.round((entry.total / maxTrend) * 48))}px`,
                }}
              />
            ))}
          </div>

          {byRule.length > 0 && (
            <ul className="space-y-1 text-sm">
              {byRule.map((rule) => (
                <li
                  key={rule.rule_id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="text-gray-700">{rule.rule}</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {rule.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function PredictiveAtRiskCard({
  predictive,
}: {
  predictive: PredictiveAtRiskData | null;
}) {
  const members = predictive?.members ?? [];

  return (
    <section
      aria-label="Predictive At-Risk"
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">
          Predictive At-Risk
        </h3>
        <span className="ml-auto text-xs text-gray-400">
          Projected days to 3-miss red threshold
        </span>
      </div>
      {!predictive ? (
        <p className="text-sm text-gray-400">Loading at-risk projection…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">No at-risk members projected.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs text-gray-500">
            <tr>
              <th className="py-2 pr-3 font-medium">Member</th>
              <th className="py-2 pr-3 font-medium">Missed</th>
              <th className="py-2 pr-3 font-medium">Days to Red</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member) => (
              <tr key={member.user_id}>
                <td className="py-2 pr-3 text-gray-900">
                  {member.full_name ?? member.email ?? member.user_id}
                </td>
                <td className="py-2 pr-3 tabular-nums text-gray-600">
                  {member.missed_days}
                </td>
                <td className="py-2 pr-3 tabular-nums">
                  {member.projected_red_in_days === null ? (
                    <span className="text-gray-400">
                      {member.missed_days >= 3 ? "Already red" : "—"}
                    </span>
                  ) : (
                    <span className="font-medium text-amber-700">
                      {member.projected_red_in_days}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function FaithfulParentsCard({
  parents,
  onAwarded,
}: {
  parents: FaithfulParentSignal[] | null;
  onAwarded: (parents: FaithfulParentSignal[] | null) => void;
}) {
  const { toast } = useToast();
  const [awarding, setAwarding] = useState<Record<string, boolean>>({});

  const handleAward = async (parent: FaithfulParentSignal) => {
    setAwarding((prev) => ({ ...prev, [parent.id]: true }));
    try {
      const result = await analyticsService.awardFaithfulParent(parent.id);
      toast(result.message, result.awarded ? "success" : "error");
      if (result.awarded && parents) {
        onAwarded(
          parents.map((p) =>
            p.id === parent.id ? { ...p, is_eligible: false } : p,
          ),
        );
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Award failed", "error");
    } finally {
      setAwarding((prev) => ({ ...prev, [parent.id]: false }));
    }
  };

  return (
    <section
      aria-label="Faithful Parents"
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">
          Faithful Parents
        </h3>
        <span className="ml-auto text-xs text-gray-400">
          Child-streak consistency signals
        </span>
      </div>
      {!parents ? (
        <p className="text-sm text-gray-400">
          Loading faithful parent signals…
        </p>
      ) : parents.length === 0 ? (
        <p className="text-sm text-gray-500">
          No parents with active children.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs text-gray-500">
            <tr>
              <th className="py-2 pr-3 font-medium">Parent</th>
              <th className="py-2 pr-3 font-medium">Children</th>
              <th className="py-2 pr-3 font-medium">Min Streak</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {parents.map((parent) => (
              <tr key={parent.id}>
                <td className="py-2 pr-3 text-gray-900">
                  {parent.full_name ??
                    (parent.username ? `@${parent.username}` : parent.id)}
                </td>
                <td className="py-2 pr-3 tabular-nums text-gray-600">
                  {parent.consistent_child_count}/{parent.child_count}
                </td>
                <td className="py-2 pr-3 tabular-nums text-gray-600">
                  {parent.min_child_streak}
                </td>
                <td className="py-2 pr-3">
                  {parent.is_eligible ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Eligible
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {parent.consistent_child_count === parent.child_count
                        ? "Awarded"
                        : "Below threshold"}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right">
                  <Button
                    variant={parent.is_eligible ? "primary" : "outline"}
                    size="sm"
                    disabled={!parent.is_eligible || !!awarding[parent.id]}
                    onClick={() => handleAward(parent)}
                  >
                    {awarding[parent.id] ? "Awarding…" : "Award Badge"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
