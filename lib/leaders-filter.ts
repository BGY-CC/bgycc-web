export interface UserLike {
  role: string | null;
  status?: string | null;
}

/**
 * Filters users for the leaders list. Always applies the status filter, even
 * when a specific role tab (leader/member) is selected.
 */
export function filterUsers<T extends UserLike>(
  users: T[],
  roleFilter: string,
  statusFilter: string,
): T[] {
  return users.filter((user) => {
    if (user.role === "super_admin" || user.role === "admin") return false;
    if (roleFilter === "leader" && user.role !== "leader") return false;
    if (roleFilter === "member" && user.role === "leader") return false;
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    return true;
  });
}