import { API_CONFIG } from "../api";

export interface DetailedResource {
  id: string;
  category: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  resource_type: "pdf" | "video" | "audio" | "link" | "text" | null;
  content_text: string | null;
  xp_reward: number;
  min_rank_required: string | null;
  min_streak_required: number;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const detailedResourcesService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/detailed-resources`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<DetailedResource>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/detailed-resources`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<DetailedResource>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/detailed-resources/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/detailed-resources/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    const response = await fetch(`${API_CONFIG.BASE_URL}/detailed-resources/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return response.json();
  },
};
