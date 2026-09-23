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

export interface PromotionLogEntry {
  id: string;
  memberId: string;
  fromRankKey: string | null;
  toRankKey: string;
  status: string;
  actor: string | null;
  actorRole: string | null;
  verifiedAt: string | null;
  createdAt: string;
  memberName: string | null;
  memberAvatar: string | null;
  fromRankName: string | null;
  toRankName: string | null;
}

export interface PromotionsPage {
  total: number;
  page: number;
  limit: number;
  items: PromotionLogEntry[];
}

export const getAllPromotions = async (
  options: { page?: number; limit?: number; status?: string; search?: string } = {}
): Promise<PromotionsPage> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status) params.set("status", options.status);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();

  const response = await fetch(`${API_CONFIG.BASE_URL}/admin/promotions${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await readJson<{ success?: boolean; error?: string; message?: string; data?: PromotionsPage }>(response);
  if (!response.ok) throw new Error(result.error || result.message || "Failed to fetch promotions");
  if (!result.data) throw new Error("Failed to fetch promotions");
  return result.data;
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