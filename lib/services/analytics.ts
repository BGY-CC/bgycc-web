import { API_CONFIG, readJson } from "../api";

export interface FunnelStep {
  step: string;
  count: number;
}

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const analyticsService = {
  exportCsv: async (period: string = "month") => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/export?period=${period}&format=csv`,
      { method: "GET", headers: getAuthHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Analytics export failed (${response.status})`);
    }
    return response.text();
  },

  getFunnel: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/funnel`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{ success: boolean; funnel?: FunnelStep[] }>(
      response
    );
    if (result.success && result.funnel) return result.funnel;
    return result.funnel ?? [];
  },
};
