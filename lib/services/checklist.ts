import { API_CONFIG } from "../api";

export interface ChecklistItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pathway: "leadership" | "public_speaking" | "both";
  xp_value: number;
  day_of_week: number | null;
  day_number: number | null;
  cycle_number: number | null;
  resource_title: string | null;
  resource_url: string | null;
  is_active: boolean;
  is_curriculum_based: boolean;
  metadata?: any;
}

export interface CurriculumItem {
  id: string;
  pathway_slug: "leadership" | "public_speaking";
  day_number: number;
  title: string;
  description: string | null;
  media_url: string;
  media_type: "video" | "audio" | "image" | "text";
  xp_value?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const checklistService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/checklist`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<ChecklistItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/checklist`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (slug: string, data: Partial<ChecklistItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/checklist/${slug}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (slug: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/checklist/${slug}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (response.status === 200 || response.status === 204) return { success: true };
    return response.json();
  },
};

