import { API_CONFIG } from "../api";

export interface Quote {
  id: string;
  content: string;
  author: string | null;
  pathway_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteResponse {
  quotes: Quote[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const quotesService = {
  list: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/quotes`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data: Partial<Quote>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/quotes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Quote>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/quotes/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/quotes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (response.status === 204) return { success: true };
    return response.json();
  },
};
