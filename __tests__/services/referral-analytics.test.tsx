import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferralAnalytics } from "@/app/(dashboard)/referrals/_components/referral-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-query", () => ({
  useQuery: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseQuery = vi.mocked(useQuery);

const STATS_ALL = {
  total_referrals: 42,
  monthly_referrals: 7,
  weekly_referrals: 2,
  link_clicks: 100,
  signups: 42,
  active_members: 18,
  conversion_rate: 42.0,
  source_breakdown: { deep_link: 60, qr: 30, share: 10 },
};

const STATS_WEEK = {
  ...STATS_ALL,
  link_clicks: 10,
  signups: 4,
  active_members: 2,
  source_breakdown: { deep_link: 6, qr: 3, share: 1 },
};

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  mockedUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
  } as never);
  mockedUseQuery.mockImplementation(((endpoint: string) => {
    if (endpoint === "/referrals/stats") {
      return { data: STATS_ALL, isLoading: false, error: null, refetch: vi.fn() } as never;
    }
    if (endpoint === "/referrals/stats?period=week") {
      return { data: STATS_WEEK, isLoading: false, error: null, refetch: vi.fn() } as never;
    }
    if (endpoint === "/referrals/geo") {
      return { data: { locations: [] }, isLoading: false, error: null, refetch: vi.fn() } as never;
    }
    return { data: [], isLoading: false, error: null, refetch: vi.fn() } as never;
  }) as never);
});

describe("ReferralAnalytics source breakdown card", () => {
  it("renders real QR vs Link counts and shares from source_breakdown", async () => {
    render(<ReferralAnalytics />);

    expect(screen.getByText("QR vs Link")).toBeTruthy();
    expect(await screen.findByText("Deep Link")).toBeTruthy();
    expect(screen.getByText("QR Scan")).toBeTruthy();
    expect(screen.getByText("Share")).toBeTruthy();
    expect(screen.getByText(/60 · 60%/)).toBeTruthy();
    expect(screen.getByText(/30 · 30%/)).toBeTruthy();
    expect(screen.getByText(/10 · 10%/)).toBeTruthy();
  });

  it("shows an empty state when no source attribution exists yet", async () => {
    mockedUseQuery.mockImplementation(((endpoint: string) => {
      if (endpoint === "/referrals/stats") {
        return {
          data: { ...STATS_ALL, source_breakdown: { deep_link: 0, qr: 0, share: 0 } },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        } as never;
      }
      if (endpoint === "/referrals/geo") {
        return { data: { locations: [] }, isLoading: false, error: null, refetch: vi.fn() } as never;
      }
      return { data: [], isLoading: false, error: null, refetch: vi.fn() } as never;
    }) as never);

    render(<ReferralAnalytics />);

    expect(
      await screen.findByText(/No source attribution data yet/i)
    ).toBeTruthy();
  });

  it("refetches period-scoped stats when the period toggle changes", async () => {
    render(<ReferralAnalytics />);

    await screen.findByText("Deep Link");

    await userEvent.click(screen.getByRole("button", { name: /this week/i }));

    await waitFor(() => {
      expect(mockedUseQuery).toHaveBeenCalledWith("/referrals/stats?period=week");
    });
    expect(screen.getByText(/6 · 60%/)).toBeTruthy();
    expect(screen.getByText(/3 · 30%/)).toBeTruthy();
  });
});