import { describe, it, expect, vi, beforeEach } from "vitest";
import { referralsService } from "@/lib/services/referrals";
import { API_CONFIG } from "@/lib/api";

const TOKEN = "test-token-referrals";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(
      typeof body === "string" ? body : JSON.stringify(body)
    ),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("referralsService.getStats", () => {
  it("maps conversion_rate and active member fields from the response", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: {
        total_referrals: 42,
        monthly_referrals: 7,
        weekly_referrals: 2,
        link_clicks: 100,
        signups: 42,
        active_members: 18,
        conversion_rate: 42.0,
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const stats = await referralsService.getStats();

    expect(stats).toEqual({
      total_referrals: 42,
      monthly_referrals: 7,
      weekly_referrals: 2,
      link_clicks: 100,
      signups: 42,
      active_members: 18,
      conversion_rate: 42.0,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/referrals/stats`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
      })
    );
  });
});

describe("referralsService.getLeaderboard", () => {
  it("requests the leaderboard with the chosen timeframe", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: [
        {
          referrer_id: "99aedbd0-7e9a-4a50-9f7f-6c106a4bbc28",
          full_name: "Ada Lovelace",
          username: "ada",
          email: "ada@bgycc.org",
          profile_picture_url: null,
          referral_count: 12,
          rank: 1,
          xp: 240,
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const rows = await referralsService.getLeaderboard("monthly");

    expect(rows).toHaveLength(1);
    expect(rows[0].rank).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/referrals/leaderboard?timeframe=monthly`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
      })
    );
  });
});

describe("referralsService.getGeo", () => {
  it("returns the location distribution", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: {
        locations: [
          { label: "Lagos", count: 4, percentage: 80 },
          { label: "Abuja", count: 1, percentage: 20 },
        ],
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const geo = await referralsService.getGeo();

    expect(geo.locations[0]).toEqual({ label: "Lagos", count: 4, percentage: 80 });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/referrals/geo`,
      expect.objectContaining({ method: "GET" })
    );
  });
});