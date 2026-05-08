import { API_CONFIG, readJson } from "../api";
import { CurriculumItem } from "./checklist";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const curriculumService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  create: async (data: Partial<CurriculumItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },

  update: async (id: string, data: Partial<CurriculumItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJson(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum/${id}`, {
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
};
