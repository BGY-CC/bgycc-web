import { API_CONFIG } from "../api";

export interface Club {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  url_link?: string;
  is_active: boolean;
  total_members: number;
  active_members: number;
  average_streak: number;
  leader_name?: string; // legacy fallback
  leader_id?: string;
  leader?: {
    id?: string;
    full_name?: string;
    profile_picture_url?: string;
  };
  created_at?: string;
  // UI legacy compatibility
  region?: string; 
  status?: "Active" | "Dormant";
}

export interface ClubMemberHealth {
  demographics: {
    total: number;
    active: number;
    at_risk: number;
    reset: number;
  };
  at_risk_members: Array<{
    user_id: string;
    full_name: string | null;
    email: string | null;
    profile_picture_url: string | null;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    joined_at: string;
  }>;
}

export interface ClubStats {
  stats: {
    total_clubs: number;
    active_clubs: number;
    total_members: number;
    avg_club_score: number;
  }
}

export interface PaginatedClubs {
  clubs: Club[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const clubsService = {
  getStats: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  search: async (q: string, page = 1, pageSize = 20) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/search?q=${q}&page=${page}&page_size=${pageSize}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  list: async (filters: { state?: string; city?: string; name?: string; page?: number; page_size?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<Club>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDetails: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Club>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/${id.trim()}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (response.status === 204) return { success: true };
    
    const text = await response.text();
    try {
      const result = text ? JSON.parse(text) : { success: response.ok };
      return result;
    } catch {
      return { success: response.ok };
    }
  },


  getMemberHealth: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/${id}/member-health`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getTopPerformers: async (id: string, limit = 10) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/clubs/${id}/top-performers?limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

