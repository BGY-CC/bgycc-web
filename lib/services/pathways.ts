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

  saveVideo: async (slug: string, fileKey: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug}/video`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ file_key: fileKey }),
    });
    return response.json();
  },

  uploadVideo: async (slug: string, file: File) => {
    // 1. Get signed upload URL
    const getUrlResponse = await fetch(
      `${API_CONFIG.BASE_URL}/pathways/${slug}/video/upload-url`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          file_name: file.name,
          file_type: file.type || "video/mp4",
        }),
      }
    );

    const urlData = await getUrlResponse.json();
    if (!urlData.success) {
      return urlData;
    }

    const { uploadUrl, fileKey } = urlData.data;

    // 2. Upload directly to R2
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "video/mp4",
      },
    });

    if (!uploadResponse.ok) {
      return { success: false, error: "Direct upload to R2 failed" };
    }

    // 3. Save the fileKey to the pathway
    return pathwaysService.saveVideo(slug, fileKey);
  },
};
