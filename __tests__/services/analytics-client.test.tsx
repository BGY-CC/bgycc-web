import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticsClient } from "@/app/(dashboard)/analytics/_components/analytics-client";
import { ToastProvider } from "@/components/ui";
import { analyticsService } from "@/lib/services/analytics";
import { clubsService } from "@/lib/services/clubs";

const FUNNEL_CSV = [
  "step,started,completed,drop_rate",
  "1. Welcome,120,100,16.7",
  "complete,80,58,27.5",
].join("\n");

vi.mock("@/lib/services/analytics", () => ({
  analyticsService: {
    getFunnelCsv: vi.fn(),
    exportCsv: vi.fn(),
    getEscalations: vi.fn(),
    getPredictiveAtRisk: vi.fn(),
    getFaithfulParents: vi.fn(),
    awardFaithfulParent: vi.fn(),
  },
}));

vi.mock("@/lib/services/clubs", () => ({
  clubsService: {
    list: vi.fn(),
  },
}));

const mockedGetFunnelCsv = vi.mocked(analyticsService.getFunnelCsv);
const mockedClubsList = vi.mocked(clubsService.list);
const mockedGetEscalations = vi.mocked(analyticsService.getEscalations);
const mockedGetPredictiveAtRisk = vi.mocked(
  analyticsService.getPredictiveAtRisk,
);
const mockedGetFaithfulParents = vi.mocked(analyticsService.getFaithfulParents);
const mockedAwardFaithfulParent = vi.mocked(
  analyticsService.awardFaithfulParent,
);

const ROWS = [
  { step: "1. Welcome", started: 120, completed: 100, dropRate: 16.7 },
  { step: "complete", started: 80, completed: 58, dropRate: 27.5 },
];

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  mockedGetFunnelCsv.mockReset();
  mockedGetFunnelCsv.mockResolvedValue({ csv: FUNNEL_CSV, rows: ROWS });
  mockedClubsList.mockReset();
  mockedClubsList.mockResolvedValue({
    data: {
      clubs: [
        { id: "club-1", name: "Lagos Hub" },
        { id: "club-2", name: "Abuja Hub" },
      ],
      total: 2,
    },
  } as never);
  mockedGetEscalations.mockReset();
  mockedGetEscalations.mockResolvedValue({
    summary: {
      total: 3,
      by_severity: { yellow: 2, red: 1 },
      by_rule: [
        {
          rule_id: "r1",
          rule: "24h_no_checklist",
          severity: "yellow",
          count: 2,
        },
        { rule_id: "r2", rule: "3_streak_miss", severity: "red", count: 1 },
      ],
    },
    trend: [
      { date: "2026-09-21", total: 1 },
      { date: "2026-09-22", total: 2 },
    ],
    logs: [
      {
        id: "l1",
        user_id: "u1",
        rule: "24h_no_checklist",
        severity: "yellow",
        escalated_on: "2026-09-22",
        full_name: "Parent One",
        email: "p1@test.dev",
      },
      {
        id: "l2",
        user_id: "u1",
        rule: "3_streak_miss",
        severity: "red",
        escalated_on: "2026-09-22",
        full_name: "Parent One",
        email: "p1@test.dev",
      },
    ],
  } as never);
  mockedGetPredictiveAtRisk.mockReset();
  mockedGetPredictiveAtRisk.mockResolvedValue({
    horizon: 7,
    members: [
      {
        user_id: "u1",
        full_name: "Member One",
        email: "m1@test.dev",
        missed_days: 2,
        current_streak: 5,
        leadership_missed_days: 2,
        speaking_missed_days: 0,
        projected_red_in_days: 1,
      },
      {
        user_id: "u2",
        full_name: "Member Two",
        email: "m2@test.dev",
        missed_days: 3,
        current_streak: 0,
        leadership_missed_days: 3,
        speaking_missed_days: 0,
        projected_red_in_days: null,
      },
    ],
  } as never);
  mockedGetFaithfulParents.mockReset();
  mockedGetFaithfulParents.mockResolvedValue({
    parents: [
      {
        id: "p1",
        full_name: "Faithful Mum",
        username: "fmum",
        child_count: 3,
        consistent_child_count: 3,
        min_child_streak: 9,
        is_eligible: true,
      },
      {
        id: "p2",
        full_name: "Almost Dad",
        username: "adad",
        child_count: 2,
        consistent_child_count: 1,
        min_child_streak: 4,
        is_eligible: false,
      },
    ],
  } as never);
  mockedAwardFaithfulParent.mockReset();
  mockedAwardFaithfulParent.mockResolvedValue({
    awarded: true,
    message: "Faithful Parent badge awarded",
    signal: { child_count: 3, consistent_child_count: 3, min_child_streak: 9 },
  } as never);
});

const renderClient = () =>
  render(
    <ToastProvider>
      <AnalyticsClient />
    </ToastProvider>,
  );

describe("AnalyticsClient filters", () => {
  it("renders club/region/role filter selects with options", async () => {
    renderClient();

    await screen.findByText("1. Welcome");

    expect(screen.getByRole("combobox", { name: "Club" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Region" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Role" })).toBeTruthy();

    expect(screen.getByRole("option", { name: "Lagos Hub" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Abuja Hub" })).toBeTruthy();

    expect(screen.getByRole("option", { name: "member" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "leader" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "admin" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "parent" })).toBeTruthy();

    expect(mockedClubsList).toHaveBeenCalledWith(
      expect.objectContaining({ page_size: 1000 }),
    );
  });

  it("refetches the funnel with the selected clubId when the club filter changes", async () => {
    renderClient();
    await screen.findByText("1. Welcome");
    mockedGetFunnelCsv.mockClear();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1",
    );

    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({ clubId: "club-1" });
    });
  });

  it("refetches with region and role when those filters change", async () => {
    renderClient();
    await screen.findByText("1. Welcome");
    mockedGetFunnelCsv.mockClear();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Region" }),
      "Lagos",
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith(
        expect.objectContaining({ region: "Lagos" }),
      );
    });

    mockedGetFunnelCsv.mockClear();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      "parent",
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith(
        expect.objectContaining({ role: "parent" }),
      );
    });
  });

  it("clears all filters and refetches unfiltered", async () => {
    renderClient();
    await screen.findByText("1. Welcome");
    mockedGetFunnelCsv.mockClear();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1",
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({ clubId: "club-1" });
    });

    mockedGetFunnelCsv.mockClear();
    await userEvent.click(
      screen.getByRole("button", { name: /clear filters/i }),
    );

    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({});
    });
  });

  it("downloads the funnel CSV honoring the active filters", async () => {
    renderClient();
    await screen.findByText("1. Welcome");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1",
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({ clubId: "club-1" });
    });

    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      writable: true,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    mockedGetFunnelCsv.mockClear();
    await userEvent.click(
      screen.getByRole("button", { name: /download funnel/i }),
    );

    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({ clubId: "club-1" });
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it("opens the print dialog from the Print / PDF button", async () => {
    renderClient();
    await screen.findByText("1. Welcome");

    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);

    await userEvent.click(screen.getByRole("button", { name: /print/i }));
    expect(printSpy).toHaveBeenCalled();
  });
});

describe("AnalyticsClient escalation + predictive-at-risk cards", () => {
  it("renders the escalation summary (total + red), trend bars, and calls getEscalations()", async () => {
    renderClient();

    expect(await screen.findByText("Escalations (30d)")).toBeTruthy();
    expect(screen.getByText("3", { selector: "span" })).toBeTruthy();
    // red severity count + label present
    expect(await screen.findByText("Red")).toBeTruthy();
    expect(mockedGetEscalations).toHaveBeenCalledWith(30);
  });

  it("renders the predictive at-risk members with projected days to red and calls getPredictiveAtRisk()", async () => {
    renderClient();

    expect(await screen.findByText("Predictive At-Risk")).toBeTruthy();
    expect(screen.getByText("Member One")).toBeTruthy();
    expect(screen.getByText("Member Two")).toBeTruthy();
    expect(mockedGetPredictiveAtRisk).toHaveBeenCalledWith(7);
  });
});

describe("AnalyticsClient Faithful Parents card", () => {
  it("lists faithful-parent signals with eligibility and calls getFaithfulParents()", async () => {
    renderClient();

    expect(await screen.findByText("Faithful Parents")).toBeTruthy();
    expect(screen.getByText("Faithful Mum")).toBeTruthy();
    expect(screen.getByText("Almost Dad")).toBeTruthy();
    expect(mockedGetFaithfulParents).toHaveBeenCalled();
    expect(screen.getByText("Eligible")).toBeTruthy();
  });

  it("awards the badge for an eligible parent and refreshes the row status", async () => {
    renderClient();
    await screen.findByText("Faithful Parents");

    await userEvent.click(
      screen.getAllByRole("button", { name: "Award Badge" })[0],
    );

    await waitFor(() => {
      expect(mockedAwardFaithfulParent).toHaveBeenCalledWith("p1");
    });
    expect(await screen.findByText("Awarded")).toBeTruthy();
  });
});
