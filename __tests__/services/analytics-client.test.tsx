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
  },
}));

vi.mock("@/lib/services/clubs", () => ({
  clubsService: {
    list: vi.fn(),
  },
}));

const mockedGetFunnelCsv = vi.mocked(analyticsService.getFunnelCsv);
const mockedClubsList = vi.mocked(clubsService.list);

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
});

const renderClient = () =>
  render(
    <ToastProvider>
      <AnalyticsClient />
    </ToastProvider>
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

    expect(
      mockedClubsList
    ).toHaveBeenCalledWith(expect.objectContaining({ page_size: 1000 }));
  });

  it("refetches the funnel with the selected clubId when the club filter changes", async () => {
    renderClient();
    await screen.findByText("1. Welcome");
    mockedGetFunnelCsv.mockClear();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1"
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
      "Lagos"
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith(
        expect.objectContaining({ region: "Lagos" })
      );
    });

    mockedGetFunnelCsv.mockClear();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      "parent"
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith(
        expect.objectContaining({ role: "parent" })
      );
    });
  });

  it("clears all filters and refetches unfiltered", async () => {
    renderClient();
    await screen.findByText("1. Welcome");
    mockedGetFunnelCsv.mockClear();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1"
    );
    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({ clubId: "club-1" });
    });

    mockedGetFunnelCsv.mockClear();
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    await waitFor(() => {
      expect(mockedGetFunnelCsv).toHaveBeenCalledWith({});
    });
  });

  it("downloads the funnel CSV honoring the active filters", async () => {
    renderClient();
    await screen.findByText("1. Welcome");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "club-1"
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
    await userEvent.click(screen.getByRole("button", { name: /download funnel/i }));

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