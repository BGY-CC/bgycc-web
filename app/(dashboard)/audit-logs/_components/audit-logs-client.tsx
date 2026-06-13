"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarDays, Filter, ShieldCheck } from "lucide-react";
import { Alert, Badge, Input, Modal, ModalContent, ModalHeader, Pagination, Select, Skeleton } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { ADMIN_MUTATION_EVENT } from "@/lib/audit-events";
import { formatAuditResource, formatAuditStatement } from "@/lib/audit-format";

interface AuditActor {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: AuditActor | AuditActor[] | null;
}

interface AuditLogsResponse {
  audit_logs: AuditLog[];
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

const RESOURCE_OPTIONS = [
  "clubs",
  "profiles",
  "users",
  "pathways",
  "checklist",
  "resources",
  "detailed-resources",
  "community",
  "curriculum",
  "quotes",
  "support",
  "notifications",
  "access-management",
];

export function AuditLogsClient() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const params = new URLSearchParams({ page: page.toString(), page_size: "20" });
  if (action) params.set("action", action);
  if (resourceType) params.set("resource_type", resourceType);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data, isLoading, error, refetch } = useQuery<AuditLogsResponse>(
    `/audit-logs?${params.toString()}`,
    { cacheTtlMs: 0 },
  );

  useEffect(() => {
    const refresh = () => refetch();
    window.addEventListener(ADMIN_MUTATION_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(ADMIN_MUTATION_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refetch]);

  const logs = data?.audit_logs ?? [];
  const totalPages = data?.meta.total_pages ?? 1;

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] flex-1 space-y-5 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold text-primary">{data?.meta.total_count.toLocaleString() ?? "0"}</p>
              <p className="text-sm text-muted">Recorded administrative actions</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold capitalize text-primary">{action || "All"}</p>
              <p className="text-sm text-muted">Current action filter</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Select value={action} onChange={(event) => updateFilter(setAction, event.target.value)} className="h-11 rounded-xl">
            <option value="">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </Select>
          <Select value={resourceType} onChange={(event) => updateFilter(setResourceType, event.target.value)} className="h-11 rounded-xl">
            <option value="">All resources</option>
            {RESOURCE_OPTIONS.map((resource) => (
              <option key={resource} value={resource}>{formatAuditResource(resource)}</option>
            ))}
          </Select>
          <Input type="date" aria-label="From date" value={from} max={to || undefined} onChange={(event) => updateFilter(setFrom, event.target.value)} leftAddon={<CalendarDays className="h-4 w-4" />} />
          <Input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(event) => updateFilter(setTo, event.target.value)} leftAddon={<CalendarDays className="h-4 w-4" />} />
        </div>
      </section>

      {error && <Alert variant="error">Unable to load audit logs. Please try again.</Alert>}

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-primary">No audit records found</p>
            <p className="mt-1 text-sm text-muted">New successful admin changes will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => <AuditLogRow key={log.id} log={log} onClick={() => setSelectedLog(log)} />)}
          </div>
        )}
      </section>

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
      <AuditDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}

function AuditLogRow({ log, onClick }: { log: AuditLog; onClick: () => void }) {
  const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor;
  const status = typeof log.metadata?.status === "number" ? log.metadata.status : null;
  const actorName = actor?.full_name || actor?.email || "System administrator";
  const resourceName = typeof log.metadata?.resource_name === "string" ? log.metadata.resource_name : null;

  return (
    <button type="button" onClick={onClick} className="grid w-full gap-3 p-4 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <Badge variant={actionVariant(log.action)} className="mt-0.5 shrink-0 capitalize">{log.action}</Badge>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {formatAuditStatement(actorName, log.action, log.resource_type, resourceName)}
            </p>
            <p className="mt-1 truncate text-xs text-muted">
              {actor?.email || "No actor email"}
              {status && status >= 200 && status < 300 ? " · Successful" : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-sm font-medium text-gray-700">{formatDate(log.created_at)}</p>
        <p className="text-xs text-muted">Recorded</p>
      </div>
    </button>
  );
}

function AuditDetailsModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null;
  const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor;
  const actorName = actor?.full_name || actor?.email || "System administrator";
  const resourceName = typeof log.metadata?.resource_name === "string" ? log.metadata.resource_name : null;
  const changes = log.metadata?.changes && typeof log.metadata.changes === "object"
    ? log.metadata.changes as Record<string, unknown>
    : null;

  return (
    <Modal open onClose={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader
          icon={<Activity className="h-5 w-5 text-primary" />}
          title="Audit log details"
          description={formatAuditStatement(actorName, log.action, log.resource_type, resourceName)}
        />
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <AuditDetail label="Actor" value={`${actorName}${actor?.email && actor.email !== actorName ? ` (${actor.email})` : ""}`} />
          <AuditDetail label="Recorded" value={formatDate(log.created_at)} />
          <AuditDetail label="Action" value={log.action} />
          <AuditDetail label="Resource" value={formatAuditResource(log.resource_type)} />
          <AuditDetail label="Result" value={typeof log.metadata?.status === "number" ? `HTTP ${log.metadata.status}` : "Successful"} />
          <AuditDetail label="IP address" value={log.ip_address || "Not recorded"} />
        </dl>
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Submitted changes</p>
          {changes && Object.keys(changes).length > 0 ? (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {Object.entries(changes).map(([key, value]) => (
                <div key={key} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[160px_1fr]">
                  <span className="font-medium text-gray-600">{formatAuditResource(key.replaceAll("_", "-"))}</span>
                  <span className="break-words text-gray-900">{formatAuditValue(value)}</span>
                </div>
              ))}
            </div>
          ) : <p className="rounded-xl bg-gray-50 p-3 text-sm text-muted">No field-level details were recorded for this older event.</p>}
        </div>
      </ModalContent>
    </Modal>
  );
}

function AuditDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-medium text-gray-900">{value}</dd></div>;
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "None";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function actionVariant(action: string): "active" | "warning" | "dormant" | "default" {
  if (action === "create") return "active";
  if (action === "update") return "warning";
  if (action === "delete") return "dormant";
  return "default";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
