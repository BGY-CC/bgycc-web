import { ApiResponse } from "../api";

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

// These types are for consumers, actual fetching happens via useApi or useQuery hooks usually.
// But we define the interfaces here for consistency.
