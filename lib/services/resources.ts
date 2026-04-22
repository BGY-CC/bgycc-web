import { API_CONFIG } from "../api";

export interface Resource {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  xp_reward: number;
  is_active: boolean;
  min_rank_required: string | null;
  min_streak_required: number;
  pathway: "leadership" | "public_speaking" | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceResponse {
  resources: Resource[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const resourcesService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/resources`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<Resource>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/resources`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Resource>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/resources/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/resources/${id.trim()}`, {
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


  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    const response = await fetch(`${API_CONFIG.BASE_URL}/resources/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return response.json();
  },
};

