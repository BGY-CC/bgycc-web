import { API_CONFIG } from "../api";
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
    return response.json();
  },

  create: async (data: Partial<CurriculumItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<CurriculumItem>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/curriculum/${id}`, {
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
};
