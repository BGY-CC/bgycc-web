import { API_CONFIG, readJson } from "../api";

export type ModerationActionTaken =
  | "none"
  | "warned"
  | "muted"
  | "shadow_banned"
  | "banned";

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_type: string;
  content_id: string | null;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  action_taken: string;
  resolved_at: string | null;
  created_at: string;
}

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const moderationService = {
  getReports: async (): Promise<ModerationReport[]> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/moderation/reports`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{
      success: boolean;
      data?: { reports?: ModerationReport[] };
    }>(response);
    return result.data?.reports ?? [];
  },

  resolveReport: async (
    reportId: string,
    actionTaken: ModerationActionTaken = "none"
  ) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/moderation/reports/${reportId}/resolve`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action_taken: actionTaken }),
      }
    );
    const result = await readJson<{ success: boolean }>(response);
    if (!result.success) throw new Error("Failed to resolve report");
    return result.success;
  },

  approveReport: async (reportId: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/moderation/reports/${reportId}/approve`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    const result = await readJson<{ success: boolean }>(response);
    if (!result.success) throw new Error("Failed to approve report");
    return result.success;
  },

  rejectReport: async (reportId: string, reason: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/moderation/reports/${reportId}/reject`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      }
    );
    const result = await readJson<{ success: boolean }>(response);
    if (!result.success) throw new Error("Failed to reject report");
    return result.success;
  },

  muteUser: async (userId: string, isMuted = true, reason?: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/moderation/users/${userId}/mute`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_muted: isMuted, ...(reason ? { reason } : {}) }),
      }
    );
    const result = await readJson<{ success: boolean }>(response);
    if (!result.success) throw new Error("Failed to mute user");
    return result.success;
  },

  shadowBanUser: async (userId: string, isShadowBanned = true, reason?: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/moderation/users/${userId}/shadow-ban`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_shadow_banned: isShadowBanned,
          ...(reason ? { reason } : {}),
        }),
      }
    );
    const result = await readJson<{ success: boolean }>(response);
    if (!result.success) throw new Error("Failed to shadow-ban user");
    return result.success;
  },
};