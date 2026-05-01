import { API_CONFIG } from "../api";

export interface Pathway {
  id: string;
  label: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  video_link: string | null;
  details: string | null;
  is_active: boolean;
  slug: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const pathwaysService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<Pathway>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDetails: async (slug: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  update: async (slug: string, data: Partial<Pathway>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (slug: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug.trim()}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (response.status === 204 || response.status === 200) return { success: true };
    
    try {
      const result = await response.json();
      return result;
    } catch {
      return { success: response.ok };
    }
  },

  uploadVideo: async (slug: string, file: File) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("slug", slug);

    const token =
      typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    const headers = {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const primaryResponse = await fetch(
      `${API_CONFIG.BASE_URL}/pathways/${slug}/upload-video`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    if (primaryResponse.status !== 404) {
      return primaryResponse.json();
    }

    const fallbackResponse = await fetch(
      `${API_CONFIG.BASE_URL}/pathways/upload-video`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    return fallbackResponse.json();
  },
};
