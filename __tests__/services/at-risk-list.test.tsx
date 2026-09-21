import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AtRiskMemberList } from "@/app/(dashboard)/clubs/_components/at-risk-list";
import { ToastProvider } from "@/components/ui";
import { clubsService } from "@/lib/services/clubs";

vi.mock("@/lib/services/clubs", () => ({
  clubsService: {
    broadcastAlert: vi.fn(),
  },
}));

const base = {
  email: null,
  profile_picture_url: null,
  joined_at: "2026-01-01T00:00:00.000Z",
};

const RED = {
  ...base,
  user_id: "red-1",
  full_name: "Red Member",
  current_streak: 0,
  longest_streak: 9,
  last_activity_date: null,
  severity: "red" as const,
};

const YELLOW = {
  ...base,
  user_id: "yellow-1",
  full_name: "Yellow Member",
  current_streak: 0,
  longest_streak: 3,
  last_activity_date: null,
  severity: "yellow" as const,
};

const NONE = {
  ...base,
  user_id: "none-1",
  full_name: "No Severity Member",
  current_streak: 0,
  longest_streak: 2,
  last_activity_date: null,
  severity: null,
};

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  vi.mocked(clubsService.broadcastAlert).mockReset();
  vi.mocked(clubsService.broadcastAlert).mockResolvedValue({
    success: true,
    data: { message: "Broadcast alert sent" },
  });
});

const renderList = (overrides: Partial<React.ComponentProps<typeof AtRiskMemberList>> = {}) =>
  render(
    <ToastProvider>
      <AtRiskMemberList
        clubId="club-1"
        members={[RED, YELLOW, NONE]}
        onSelectMember={vi.fn()}
        onBroadcasted={vi.fn()}
        {...overrides}
      />
    </ToastProvider>
  );

describe("AtRiskMemberList severity + broadcast", () => {
  it("shows red and yellow severity badges with a Broadcast button only on red members", async () => {
    renderList();

    await screen.findByText("Red Member");

    expect(screen.getByText("Red")).toBeTruthy();
    expect(screen.getByText("Yellow")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /broadcast/i })).toHaveLength(1);
  });

  it("renders no badge and no Broadcast button for members without a severity", async () => {
    render(
      <ToastProvider>
        <AtRiskMemberList clubId="club-1" members={[NONE]} onSelectMember={vi.fn()} />
      </ToastProvider>
    );

    await screen.findByText("No Severity Member");

    expect(screen.queryByText("Red")).toBeNull();
    expect(screen.queryByText("Yellow")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /broadcast/i })).toHaveLength(0);
  });

  it("broadcasts after confirmation, calls the service, toasts and refetches", async () => {
    const user = userEvent.setup();
    const onBroadcasted = vi.fn();
    renderList({ onBroadcasted });

    await screen.findByText("Red Member");
    await user.click(screen.getByRole("button", { name: /broadcast/i }));

    expect(await screen.findByText("Send broadcast alert?")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /^Send alert$/ }));

    await waitFor(() => {
      expect(clubsService.broadcastAlert).toHaveBeenCalledWith("club-1", "red-1");
      expect(onBroadcasted).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Alert sent to Red Member/)).toBeTruthy();
  });

  it("lets the confirm dialog be cancelled without calling the service", async () => {
    const user = userEvent.setup();
    renderList();

    await screen.findByText("Red Member");
    await user.click(screen.getByRole("button", { name: /broadcast/i }));
    expect(await screen.findByText("Send broadcast alert?")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /^Cancel$/ }));

    await waitFor(() => {
      expect(screen.queryByText("Send broadcast alert?")).toBeNull();
    });
    expect(clubsService.broadcastAlert).not.toHaveBeenCalled();
  });

  it("opens the member detail when a member row is clicked", async () => {
    const user = userEvent.setup();
    const onSelectMember = vi.fn();
    renderList({ onSelectMember });

    await screen.findByText("Red Member");
    await user.click(screen.getByText("Red Member"));

    expect(onSelectMember).toHaveBeenCalledWith("red-1");
  });

  it("shows an empty state when there are no at-risk members", () => {
    render(
      <ToastProvider>
        <AtRiskMemberList clubId="club-1" members={[]} onSelectMember={vi.fn()} />
      </ToastProvider>
    );

    expect(screen.getByText(/No at-risk members found/)).toBeTruthy();
  });
});