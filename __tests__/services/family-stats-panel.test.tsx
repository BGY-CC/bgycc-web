import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FamilyStatsPanel } from "@/app/(dashboard)/families/_components/family-stats-panel";
import type { FamilyStats } from "@/lib/services/families";

const STATS: FamilyStats = {
  family_id: "parent-1",
  members: 3,
  active_children: 2,
  children: [
    {
      id: "child-1",
      full_name: "Ada Nwosu",
      status: "active",
      streak: 7,
      longest_streak: 14,
      badges: [
        { slug: "poet", name: "Poet of Words", icon_url: null },
        { slug: "streak-30", name: "Thirty Day Flame", icon_url: null },
      ],
      relationship: null,
    },
    {
      id: "child-2",
      full_name: "Bola Okoye",
      status: "pending",
      streak: 5,
      longest_streak: 9,
      badges: [],
      relationship: null,
    },
  ],
  average_streak: 11,
  badges: [{ slug: "poet", name: "Poet of Words", icon_url: null, member_count: 1 }],
};

describe("FamilyStatsPanel", () => {
  it("renders the family rollups: members, active children, average streak and badge count", () => {
    render(<FamilyStatsPanel stats={STATS} isLoading={false} error={null} onRetry={vi.fn()} />);

    expect(screen.getByText("Total Members")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Active Children")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Average Streak")).toBeTruthy();
    expect(screen.getByText("11")).toBeTruthy();
    expect(screen.getByText("Family Badges")).toBeTruthy();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });

  it("lists each child with their status, current streak and longest streak", () => {
    render(<FamilyStatsPanel stats={STATS} isLoading={false} error={null} onRetry={vi.fn()} />);

    expect(screen.getByText("Ada Nwosu")).toBeTruthy();
    expect(screen.getByText("7d")).toBeTruthy();
    expect(screen.getByText("14d")).toBeTruthy();
    expect(screen.getByText("Bola Okoye")).toBeTruthy();
    expect(screen.getByText("5d")).toBeTruthy();
    expect(screen.getByText("9d")).toBeTruthy();
  });

  it("shows per-child badges and the aggregate badge row", () => {
    render(<FamilyStatsPanel stats={STATS} isLoading={false} error={null} onRetry={vi.fn()} />);

    expect(screen.getAllByText("Poet of Words").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Thirty Day Flame")).toBeTruthy();
  });

  it("renders an empty state when the family has no children", () => {
    render(
      <FamilyStatsPanel
        stats={{ ...STATS, members: 1, active_children: 0, children: [], badges: [] }}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/No children in this family yet/)).toBeTruthy();
  });

  it("renders a loading state while fetching", () => {
    render(<FamilyStatsPanel stats={null} isLoading error={null} onRetry={vi.fn()} />);

    expect(screen.getByText("Loading family stats…")).toBeTruthy();
  });

  it("renders an error state with a working retry button on failure", () => {
    const onRetry = vi.fn();
    render(
      <FamilyStatsPanel
        stats={null}
        isLoading={false}
        error={new Error("boom")}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText(/boom/)).toBeTruthy();
    screen.getByRole("button", { name: /Retry/i }).click();
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders a not-found state when no stats come back without an error", () => {
    render(<FamilyStatsPanel stats={null} isLoading={false} error={null} onRetry={vi.fn()} />);

    expect(screen.getByText(/We couldn't find this family/)).toBeTruthy();
  });
});