import { API_CONFIG, readJson } from "../api";

export type RankStatus =
  | "ELIGIBLE"
  | "UNDER_REVIEW"
  | "LEADER_APPROVED"
  | "CONFIRMED"
  | "PROMOTED"
  | "REJECTED";

export interface RankInfo {
  key: string;
  name: string;
  symbol: string;
  tier: number;
}

export interface PendingApproval {
  memberId: string;
  memberName: string | null;
  username: string | null;
  profilePictureUrl: string | null;
  targetRank: RankInfo;
  status: RankStatus;
  updatedAt: string | null;
}

export interface RankDistributionItem {
  key: string;
  name: string;
  symbol: string;
  count: number;
}

export interface CelebrationItem {
  memberId: string;
  memberName: string | null;
  username: string | null;
  profilePictureUrl: string | null;
  rank: RankInfo;
  promotedAt: string | null;
}

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export const leaderRanksService = {
  confirm: async (memberId: string, targetRankKey: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/ranks/confirm`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, targetRankKey }),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to confirm promotion");
    return result;
  },

  revert: async (memberId: string, targetRankKey: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/ranks/revert`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, targetRankKey }),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to revert promotion");
    return result;
  },
};