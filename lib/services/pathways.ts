import { API_CONFIG, readJson, ServiceResult } from "../api";

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

interface UploadUrlData {
  uploadUrl: string;
  fileKey: string;
}

export const pathwaysService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  create: async (data: Partial<Pathway>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },

  getDetails: async (slug: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  update: async (slug: string, data: Partial<Pathway>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },

  delete: async (slug: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pathways/${slug.trim()}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.status === 204 || response.status === 200) return { success: true };

    try {
      return await readJson(response);
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
    return readJson(response);
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

    const urlData = await readJson<ServiceResult<UploadUrlData>>(getUrlResponse);
    if (!urlData.success || !urlData.data) {
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
