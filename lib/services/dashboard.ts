import { API_CONFIG, readJson } from "../api";

export interface DashboardStats {
  active_users: StatValue;
  avg_daily_reports: StatValue;
  avg_streak_days: StatValue;
  at_risk_members: StatValue;
  reset_members: StatValue;
  audio_reports: StatValue;
}

interface StatValue {
  value: number;
  previous_value: number | null;
  change_percent: number | null;
  trend: "up" | "down" | "flat";
}

export interface EngagementTrend {
  label: string;
  date: string;
  reports: number;
  active_users: number;
}

export interface DashboardData {
  period: string;
  period_start: string;
  period_end: string;
  stats: DashboardStats;
  member_status: {
    active: number;
    at_risk: number;
    reset: number;
    total: number;
  };
  engagement_trends: EngagementTrend[];
}

export const dashboardService = {
  getDashboardData: async (period: "week" | "month" | "year" = "week") => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("bgycc-token") : null;
    const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard?period=${period}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });
    return readJson(response);
  },

  healthCheck: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace("/admin", "")}/admin`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return readJson(response);
  },
};

