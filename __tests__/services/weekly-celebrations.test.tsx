import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeeklyCelebrations } from "@/app/(dashboard)/leadership/_components/weekly-celebrations";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";

vi.mock("@/hooks/use-auth", () => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/use-query", () => ({ useQuery: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false } as never);
});

describe("WeeklyCelebrations", () => {
  it("queries /ranks/celebrations with a YYYY-MM-DD week and renders the celebrations envelope", () => {
    mockedUseQuery.mockReturnValue({
      data: {
        week_start: "2026-01-12",
        week_end: "2026-01-19",
        celebrations: [
          {
            id: "p1",
            member_id: "m1",
            member_name: "Grace Hopper",
            profile_picture_url: null,
            from_rank_key: "trainer",
            to_rank_key: "executive_trainer",
            to_rank_name: "Executive Trainer",
            to_rank_symbol: "ET",
            promoted_at: "2026-01-13T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<WeeklyCelebrations />);
    const endpoint = mockedUseQuery.mock.calls[0][0] as string;
    expect(endpoint).toMatch(/^\/ranks\/celebrations\?week=\d{4}-\d{2}-\d{2}$/);
    expect(mockedUseQuery.mock.calls[0][0]).not.toContain("-W");
    expect(screen.getByText("Grace Hopper")).toBeTruthy();
    expect(screen.getByText("Executive Trainer")).toBeTruthy();
  });
});