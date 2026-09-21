import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModerationClient } from "@/app/(dashboard)/moderation/_components/moderation-client";
import { ToastProvider } from "@/components/ui";
import { moderationService } from "@/lib/services/moderation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@/hooks/use-query";

const PENDING = [
  {
    id: "report-1",
    reporter_id: "user_1",
    reported_user_id: "user_2",
    content_type: "comment",
    content_id: null,
    reason: "Spam",
    status: "pending",
    action_taken: "",
    resolved_at: null,
    created_at: "2026-09-18T10:00:00.000Z",
  },
];

vi.mock("@/lib/services/moderation", () => ({
  moderationService: {
    getReports: vi.fn(),
    approveReport: vi.fn(),
    rejectReport: vi.fn(),
    resolveReport: vi.fn(),
    muteUser: vi.fn(),
    shadowBanUser: vi.fn(),
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-query", () => ({
  useQuery: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseQuery = vi.mocked(useQuery);

const refetchMock = vi.fn();

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  refetchMock.mockReset();
  vi.mocked(moderationService.approveReport).mockReset();
  vi.mocked(moderationService.rejectReport).mockReset();
  vi.mocked(moderationService.approveReport).mockResolvedValue(true);
  vi.mocked(moderationService.rejectReport).mockResolvedValue(true);

  mockedUseAuth.mockReturnValue({
    user: { id: "admin-1", email: "a@b.c", role: "admin" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  } as never);

  mockedUseQuery.mockReturnValue({
    data: { reports: PENDING },
    isLoading: false,
    error: null,
    refetch: refetchMock,
  } as never);
});

const renderClient = () =>
  render(
    <ToastProvider>
      <ModerationClient />
    </ToastProvider>
  );

describe("ModerationClient approve/reject", () => {
  it("approves a pending report and refetches", async () => {
    renderClient();

    await screen.findByText("Spam");

    await userEvent.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(moderationService.approveReport).toHaveBeenCalledWith("report-1");
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it("demands a non-empty reason before submitting a rejection", async () => {
    renderClient();

    await screen.findByText("Spam");
    await userEvent.click(screen.getByRole("button", { name: /reject/i }));

    const submit = screen.getByRole("button", { name: /^reject report$/i });
    expect(submit).toHaveProperty("disabled", true);

    await userEvent.type(screen.getByRole("textbox", { name: /reason/i }), "  ");
    expect(submit).toHaveProperty("disabled", true);

    await userEvent.type(
      screen.getByRole("textbox", { name: /reason/i }),
      "Not a violation"
    );
    expect(submit).toHaveProperty("disabled", false);

    await userEvent.click(submit);

    await waitFor(() => {
      expect(moderationService.rejectReport).toHaveBeenCalledWith(
        "report-1",
        "Not a violation"
      );
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it("keeps resolve/mute/shadow-ban working", async () => {
    renderClient();

    await screen.findByText("Spam");

    expect(screen.getByRole("button", { name: /resolve/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /mute/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /shadow ban/i })).toBeTruthy();
  });

  it("hides the queue from non-admin roles", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "member-1", email: "m@b.c", role: "member" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    } as never);

    renderClient();

    expect(await screen.findByText(/admin access required/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /approve/i })).toBeNull();

    expect(mockedUseQuery).toHaveBeenCalledWith(
      "/moderation/reports",
      expect.objectContaining({ enabled: false })
    );
  });
});