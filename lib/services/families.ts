import { API_CONFIG, readJson } from "../api";

export interface FamilyBadge {
  slug: string;
  name: string | null;
  icon_url: string | null;
}

export interface FamilyBadgeAgg extends FamilyBadge {
  member_count: number;
}

export interface FamilyChild {
  id: string;
  full_name: string | null;
  status: string;
  streak: number;
  longest_streak: number;
  badges: FamilyBadge[];
  // Parent-child relationship row; opaque to the admin UI.
  relationship: unknown;
}

export interface FamilyStats {
  family_id: string;
  members: number;
  active_children: number;
  children: FamilyChild[];
  average_streak: number;
  badges: FamilyBadgeAgg[];
}

export interface MergeFamiliesInput {
  primaryParentId: string;
  secondaryParentId: string;
}

export interface SplitFamiliesInput {
  parentId: string;
  childId: string;
  destinationParentId: string;
}

export interface ReassignApprovalRequest {
  id: string;
  requested_by: string;
  requester_name: string | null;
  requester_avatar: string | null;
  club_id: string;
  club_name: string | null;
  user_ids: string[];
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export const familiesService = {
  getStats: async (familyId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/families/${familyId}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  merge: async (data: MergeFamiliesInput) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/families/merge`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },

  split: async (data: SplitFamiliesInput) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/families/split`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },
};

export const reassignApprovalsService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/reassign-requests/pending`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{
      success?: boolean;
      error?: string;
      message?: string;
      data?: { requests: ReassignApprovalRequest[] };
    }>(response);
    if (!response.ok) {
      throw new Error(result.error || result.message || "Failed to load reassign requests");
    }
    return result;
  },

  confirm: async (requestId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/reassign-requests/${requestId}/confirm`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to apply reassign request");
    return result;
  },

  reject: async (requestId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/reassign-requests/${requestId}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{ success?: boolean; error?: string; message?: string }>(response);
    if (!response.ok) throw new Error(result.error || result.message || "Failed to reject reassign request");
    return result;
  },
};