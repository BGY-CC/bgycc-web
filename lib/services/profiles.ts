import { API_CONFIG, readJson } from "../api";

export interface UserProfile {
  role_assigned_at: string | null;
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  state: string | null;
  timezone: string | null;
  gender: "male" | "female" | null;
  profile_picture_url: string | null;
  pathway_id: string | null;
  referral_code: string | null;
  role: "member" | "leader" | "admin" | "super_admin" | "parent" | null;
  partner_id: string | null;
  club_id: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "at_risk" | "reset" | "missed" | null;
  club?: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  club_members?: {
    joined_at: string;
  }[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const profilesService = {
  list: async (page = 1, pageSize = 20) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users?page=${page}&page_size=${pageSize}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  getDetails: async (userId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  search: async (q: string, page = 1, pageSize = 20) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/search?q=${q}&page=${page}&page_size=${pageSize}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  updateRole: async (userId: string, role: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/profiles/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return readJson(response);
  },
};
