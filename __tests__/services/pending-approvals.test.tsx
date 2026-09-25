import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PendingApprovals } from "@/app/(dashboard)/leadership/_components/pending-approvals";
import { ToastProvider } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";

vi.mock("@/hooks/use-auth", () => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/use-query", () => ({ useQuery: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false } as never);
});

describe("PendingApprovals", () => {
  it("queries /ranks/pending and renders members from the verifications envelope", () => {
    mockedUseQuery.mockReturnValue({
      data: {
        verifications: [
          {
            member_id: "m1",
            member_name: "Ada Lovelace",
            member_avatar: null,
            target_rank_key: "executive_trainer",
            rank_name: "Executive Trainer",
            rank_symbol: "ET",
            status: "LEADER_APPROVED",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <ToastProvider>
        <PendingApprovals />
      </ToastProvider>
    );
    expect(mockedUseQuery.mock.calls[0][0]).toBe("/ranks/pending");
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText(/Executive Trainer/)).toBeTruthy();
  });

  it("renders the empty state when the envelope is empty", () => {
    mockedUseQuery.mockReturnValue({
      data: { verifications: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <ToastProvider>
        <PendingApprovals />
      </ToastProvider>
    );
    expect(screen.getByText(/No promotions pending your confirmation/)).toBeTruthy();
  });
});