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

export interface VerificationRow {
  id?: string;
  member_id: string;
  member_name: string | null;
  member_avatar: string | null;
  username?: string | null;
  target_rank_key: string;
  rank_name: string | null;
  rank_symbol: string | null;
  tier?: number | null;
  status: RankStatus;
  updated_at: string | null;
}

export interface PendingPayload {
  verifications: VerificationRow[];
}

export const mapPendingApproval = (r: VerificationRow): PendingApproval => ({
  memberId: r.member_id,
  memberName: r.member_name,
  username: r.username ?? null,
  profilePictureUrl: r.member_avatar,
  targetRank: {
    key: r.target_rank_key,
    name: r.rank_name ?? r.target_rank_key,
    symbol: r.rank_symbol ?? "",
    tier: r.tier ?? 0,
  },
  status: r.status,
  updatedAt: r.updated_at ?? null,
});

export interface DistributionRow {
  rank_key: string;
  tier: number | null;
  name: string;
  symbol: string | null;
  count: number;
}

export interface DistributionPayload {
  distribution: DistributionRow[];
}

export const mapDistributionItem = (r: DistributionRow): RankDistributionItem => ({
  key: r.rank_key,
  name: r.name,
  symbol: r.symbol ?? "",
  count: r.count,
});

export interface CelebrationRow {
  id: string;
  member_id: string;
  member_name: string | null;
  profile_picture_url: string | null;
  from_rank_key: string | null;
  to_rank_key: string;
  to_rank_name: string | null;
  to_rank_symbol: string | null;
  promoted_at: string | null;
}

export interface CelebrationsPayload {
  week_start: string;
  week_end: string;
  celebrations: CelebrationRow[];
}

export const mapCelebration = (r: CelebrationRow): CelebrationItem => ({
  memberId: r.member_id,
  memberName: r.member_name,
  username: null,
  profilePictureUrl: r.profile_picture_url,
  rank: { key: r.to_rank_key, name: r.to_rank_name ?? r.to_rank_key, symbol: r.to_rank_symbol ?? "", tier: 0 },
  promotedAt: r.promoted_at ?? null,
});

export const getAllPromotions = async (
  options: { page?: number; limit?: number; status?: string; search?: string } = {}
): Promise<PromotionsPage> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status) params.set("status", options.status);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();

  const response = await fetch(`${API_CONFIG.BASE_URL}/promotions${qs ? `?${qs}` : ""}`, {
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/ranks/confirm`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, targetRankKey }),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to confirm promotion");
    return result;
  },

  revert: async (memberId: string, targetRankKey: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ranks/revert`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, targetRankKey }),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to revert promotion");
    return result;
  },
};