import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAllPromotions,
  leaderRanksService,
  mapPendingApproval,
  mapDistributionItem,
  mapCelebration,
} from "@/lib/services/ranks";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("allPromotions/confirm/revert drop the /admin prefix", () => {
  it("calls /promotions (no /admin) with params", async () => {
    const fetchMock = mockFetch({ success: true, data: { total: 1, page: 1, limit: 2, items: [] } });
    vi.stubGlobal("fetch", fetchMock);
    await getAllPromotions({ page: 1, limit: 2 });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/promotions?page=1&limit=2`, expect.objectContaining({ method: "GET" }));
  });

  it("confirm and revert call /ranks/confirm and /ranks/revert without /admin", async () => {
    const fetchMock = mockFetch({ success: true, data: {} });
    vi.stubGlobal("fetch", fetchMock);
    await leaderRanksService.confirm("m1", "trainer");
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/ranks/confirm`, expect.objectContaining({ method: "POST" }));
    await leaderRanksService.revert("m1", "trainer");
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/ranks/revert`, expect.objectContaining({ method: "POST" }));
  });
});

describe("envelope mappers", () => {
  it("mapPendingApproval maps a verification row", () => {
    const mapped = mapPendingApproval({
      member_id: "m1",
      member_name: "Ada",
      member_avatar: "https://x/a.png",
      target_rank_key: "trainer",
      rank_name: "Trainer",
      rank_symbol: "T",
      tier: 2,
      status: "LEADER_APPROVED",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    expect(mapped).toEqual({
      memberId: "m1",
      memberName: "Ada",
      username: null,
      profilePictureUrl: "https://x/a.png",
      targetRank: { key: "trainer", name: "Trainer", symbol: "T", tier: 2 },
      status: "LEADER_APPROVED",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("mapDistributionItem maps a distribution row", () => {
    expect(mapDistributionItem({ rank_key: "coach", tier: 1, name: "Coach", symbol: "C", count: 5 })).toEqual({
      key: "coach",
      name: "Coach",
      symbol: "C",
      count: 5,
    });
  });

  it("mapCelebration maps a celebration row", () => {
    const mapped = mapCelebration({
      id: "p1",
      member_id: "m1",
      member_name: "Grace",
      profile_picture_url: null,
      from_rank_key: "trainer",
      to_rank_key: "executive_trainer",
      to_rank_name: "Executive Trainer",
      to_rank_symbol: "ET",
      promoted_at: "2026-01-02T00:00:00.000Z",
    });
    expect(mapped.memberId).toBe("m1");
    expect(mapped.memberName).toBe("Grace");
    expect(mapped.rank.key).toBe("executive_trainer");
    expect(mapped.rank.name).toBe("Executive Trainer");
    expect(mapped.promotedAt).toBe("2026-01-02T00:00:00.000Z");
  });
});