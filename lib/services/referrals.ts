import { API_CONFIG, readJson } from "../api";

export interface ReferralStats {
  total_referrals: number;
  monthly_referrals: number;
  weekly_referrals: number;
  link_clicks: number;
  signups: number;
  active_members: number;
  conversion_rate: number;
}

export interface ReferralLeaderboardItem {
  referrer_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  profile_picture_url: string | null;
  referral_count: number;
  rank: number;
  xp: number;
}

export interface ReferralGeoLocation {
  label: string;
  count: number;
  percentage: number;
}

export interface ReferralGeoData {
  locations: ReferralGeoLocation[];
}

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const referralsService = {
  getStats: async (): Promise<ReferralStats> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/referrals/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{
      success: boolean;
      data?: ReferralStats;
    }>(response);
    return (
      result.data ?? {
        total_referrals: 0,
        monthly_referrals: 0,
        weekly_referrals: 0,
        link_clicks: 0,
        signups: 0,
        active_members: 0,
        conversion_rate: 0,
      }
    );
  },

  getLeaderboard: async (
    timeframe: "weekly" | "monthly" = "monthly"
  ): Promise<ReferralLeaderboardItem[]> => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/referrals/leaderboard?timeframe=${timeframe}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    const result = await readJson<{
      success: boolean;
      data?: ReferralLeaderboardItem[];
    }>(response);
    return result.data ?? [];
  },

  getGeo: async (): Promise<ReferralGeoData> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/referrals/geo`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await readJson<{
      success: boolean;
      data?: ReferralGeoData;
    }>(response);
    return result.data ?? { locations: [] };
  },
};