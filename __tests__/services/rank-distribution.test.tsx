import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankDistribution } from "@/app/(dashboard)/leadership/_components/rank-distribution";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";

vi.mock("@/hooks/use-auth", () => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/use-query", () => ({ useQuery: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false } as never);
});

describe("RankDistribution", () => {
  it("queries /ranks/distribution and renders items from the distribution envelope", () => {
    mockedUseQuery.mockReturnValue({
      data: {
        distribution: [
          { rank_key: "coach", tier: 1, name: "Coach", symbol: "C", count: 5 },
          { rank_key: "trainer", tier: 2, name: "Trainer", symbol: "T", count: 3 },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<RankDistribution />);
    expect(mockedUseQuery.mock.calls[0][0]).toBe("/ranks/distribution");
    expect(screen.getByText(/Coach/)).toBeTruthy();
    expect(screen.getByText(/Trainer/)).toBeTruthy();
  });
});