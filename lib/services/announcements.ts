import { API_CONFIG } from "../api";

export interface Announcement {
  id: string;
  club_id: string | null;
  type: "announcement" | "event";
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  author_id: string | null;
  event_topic?: string | null;
  event_sub_topic?: string | null;
  event_date: string | null;
  event_time?: string | null;
  event_location: string | null;
  metadata?: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const announcementsService = {
  list: async (clubId?: string) => {
    const url = clubId 
      ? `${API_CONFIG.BASE_URL}/community/announcements?club_id=${clubId}`
      : `${API_CONFIG.BASE_URL}/community/announcements`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<Announcement>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/community/announcements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Announcement>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/community/announcements/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/community/announcements/${id.trim()}`, {
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


  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    const response = await fetch(`${API_CONFIG.BASE_URL}/community/announcements/upload`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return response.json();
  },
};

