import { API_CONFIG, readJson } from "../api";

export type AccessRole = "member" | "admin" | "technical_admin";

export interface AccessUser {
  id: string;
  email: string | null;
  full_name: string | null;
  profile_picture_url: string | null;
  role: string | null;
  role_assigned_at: string | null;
  permissions: string[];
}

const headers = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export const accessManagementService = {
  update: async (userId: string, role: AccessRole, permissions: string[]) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/access-management/${userId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ role, permissions }),
    });
    return readJson(response);
  },
};
