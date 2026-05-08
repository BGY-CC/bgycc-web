import { API_CONFIG, readJson } from "../api";

export interface SupportTicket {
  id: string;
  user_id: string;
  category: "accountabilityPartner" | "technicalIssue" | "clubRelated" | "generalInquiry" | "other";
  message: string;
  status: "pending" | "acknowledged" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface SupportResponse {
  tickets: SupportTicket[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const supportService = {
  list: async (status?: string) => {
    const url = status
      ? `${API_CONFIG.BASE_URL}/support?status=${status}`
      : `${API_CONFIG.BASE_URL}/support`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  getDetails: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/support/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson(response);
  },

  updateStatus: async (id: string, status: "pending" | "acknowledged" | "resolved") => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/support/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return readJson(response);
  },
};

