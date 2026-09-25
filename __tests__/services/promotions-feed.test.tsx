import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromotionsFeed } from "@/app/(dashboard)/leadership/_components/promotions-feed";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";
import { getAllPromotions } from "@/lib/services/ranks";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-query", () => ({
  useQuery: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseQuery = vi.mocked(useQuery);

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-promotions";

const PAGE = {
  total: 4,
  page: 1,
  limit: 2,
  items: [
    {
      id: "p1",
      memberId: "m1",
      fromRankKey: "trainer",
      toRankKey: "executive_trainer",
      status: "CONFIRMED",
      actor: "a1",
      actorRole: "admin",
      verifiedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      memberName: "Ada Lovelace",
      memberAvatar: null,
      fromRankName: "Trainer",
      toRankName: "Executive Trainer",
    },
  ],
};

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false } as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getAllPromotions", () => {
  it("calls GET /admin/promotions with page/limit/status/search params", async () => {
    const fetchMock = mockFetch({ success: true, data: PAGE });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAllPromotions({ page: 1, limit: 2, status: "CONFIRMED", search: "Ada" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/promotions?page=1&limit=2&status=CONFIRMED&search=Ada`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
    expect(result.total).toBe(4);
    expect(result.items[0].memberName).toBe("Ada Lovelace");
  });

  it("sends no query string when no options are provided", async () => {
    const fetchMock = mockFetch({ success: true, data: PAGE });
    vi.stubGlobal("fetch", fetchMock);

    await getAllPromotions();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/promotions`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("throws when the response is not ok", async () => {
    const fetchMock = mockFetch({ success: false, error: "oops" }, 400);
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAllPromotions()).rejects.toThrow("oops");
  });
});

describe("PromotionsFeed", () => {
  it("renders promotion log entries with member, rank transition and status", () => {
    mockedUseQuery.mockReturnValue({
      data: PAGE,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<PromotionsFeed />);

    expect(screen.getByText("Promotion Log")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText(/Trainer → Executive Trainer/)).toBeTruthy();
    expect(screen.getByText("CONFIRMED")).toBeTruthy();
  });

  it("renders an empty state when the log has no entries", () => {
    mockedUseQuery.mockReturnValue({
      data: { total: 0, page: 1, limit: 10, items: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<PromotionsFeed />);

    expect(screen.getByText(/No promotions recorded yet/)).toBeTruthy();
  });
});