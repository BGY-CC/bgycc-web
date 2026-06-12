"use client";

import { useState } from "react";
import { KeyRound, Settings2, ShieldCheck, UserCog } from "lucide-react";
import { Badge, Button, Checkbox, Modal, ModalContent, ModalFooter, ModalHeader, Pagination, Select, Skeleton, useToast } from "@/components/ui";
import { SearchInput } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useQuery } from "@/hooks/use-query";
import { AccessRole, AccessUser, accessManagementService } from "@/lib/services/access-management";

interface AccessResponse {
  users: AccessUser[];
  available_permissions: string[];
  meta: { page: number; total_count: number; total_pages: number };
}

export function AccessManagementClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [selected, setSelected] = useState<AccessUser | null>(null);
  const params = new URLSearchParams({ page: page.toString(), page_size: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  const { data, isLoading, refetch } = useQuery<AccessResponse>(`/access-management?${params}`,
    { enabled: user?.role === "super_admin" });

  if (user?.role !== "super_admin") {
    return <div className="mx-auto w-full max-w-3xl px-4"><div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-red-500" /><h2 className="mt-3 font-semibold text-primary">Super Admin access required</h2><p className="mt-1 text-sm text-muted">Only Super Admins can assign control-center roles and permissions.</p></div></div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 space-y-5 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Summary icon={<UserCog className="h-5 w-5" />} value={data?.meta.total_count ?? 0} label="Assignable users" />
        <Summary icon={<KeyRound className="h-5 w-5" />} value={data?.available_permissions.length ?? 0} label="Technical permissions" />
      </div>
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm"><SearchInput placeholder="Search by name or email..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />) : data?.users.map((accessUser) => (
          <article key={accessUser.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold text-primary">{accessUser.full_name || "Unnamed user"}</h2><Badge variant={accessUser.role === "admin" ? "primary" : accessUser.role === "technical_admin" ? "warning" : "default"}>{roleLabel(accessUser.role)}</Badge></div><p className="truncate text-sm text-muted">{accessUser.email}</p>{accessUser.permissions.length > 0 && <p className="mt-2 text-xs text-subtle">{accessUser.permissions.map(permissionLabel).join(" · ")}</p>}</div>
            <Button variant="secondary" leftIcon={<Settings2 className="h-4 w-4" />} onClick={() => setSelected(accessUser)}>Manage access</Button>
          </article>
        ))}
      </div>
      {(data?.meta.total_pages ?? 1) > 1 && <Pagination currentPage={page} totalPages={data?.meta.total_pages ?? 1} onPageChange={setPage} />}
      <AccessModal key={selected?.id || "closed"} user={selected} availablePermissions={data?.available_permissions ?? []} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); refetch(); toast("Access updated successfully"); }} />
    </div>
  );
}

function AccessModal({ user, availablePermissions, onClose, onSaved }: { user: AccessUser | null; availablePermissions: string[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [role, setRole] = useState<AccessRole>(() => user?.role === "admin" || user?.role === "technical_admin" ? user.role : "member");
  const [permissions, setPermissions] = useState<string[]>(() => user?.permissions ?? []);
  const [saving, setSaving] = useState(false);
  const save = async () => { if (!user) return; setSaving(true); try { const result = await accessManagementService.update(user.id, role, role === "technical_admin" ? permissions : []) as { success?: boolean; error?: string }; if (!result.success) return toast(result.error || "Failed to update access", "error"); onSaved(); } catch (error) { toast(error instanceof Error ? error.message : "Failed to update access", "error"); } finally { setSaving(false); } };
  return <Modal open={!!user} onClose={onClose}><ModalContent className="max-w-xl"><ModalHeader icon={<KeyRound className="h-5 w-5" />} title="Manage Control-Center Access" description={user ? `${user.full_name || "User"} · ${user.email}` : ""} /><div className="space-y-5"><div><label className="mb-2 block text-sm font-semibold text-primary">Role</label><Select value={role} onChange={(event) => setRole(event.target.value as AccessRole)} className="h-11 rounded-xl"><option value="member">No admin access</option><option value="admin">Admin - full operational access</option><option value="technical_admin">Technical Admin - scoped access</option></Select></div>{role === "technical_admin" && <div><p className="mb-3 text-sm font-semibold text-primary">Permissions</p><div className="space-y-3 rounded-xl border border-border p-4">{availablePermissions.map((permission) => <Checkbox key={permission} id={permission} label={permissionDescription(permission)} checked={permissions.includes(permission)} onChange={(event) => setPermissions((current) => event.target.checked ? [...current, permission] : current.filter((item) => item !== permission))} />)}</div></div>}</div><ModalFooter><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} isLoading={saving}>Save access</Button></ModalFooter></ModalContent></Modal>;
}

function Summary({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) { return <div className="rounded-2xl border border-border bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">{icon}</span><div><p className="text-xl font-semibold text-primary">{value.toLocaleString()}</p><p className="text-sm text-muted">{label}</p></div></div></div>; }
function roleLabel(role: string | null) { return (role || "member").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function permissionLabel(permission: string) { return permission.replace(".", " "); }
function permissionDescription(permission: string) { const labels: Record<string, string> = { "dashboard.view": "View operational dashboard", "support.manage": "Manage technical support tickets", "notifications.view": "View admin notifications", "audit.view": "Review audit logs" }; return labels[permission] || permission; }
