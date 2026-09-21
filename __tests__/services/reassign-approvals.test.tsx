import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReassignApprovals } from "@/app/(dashboard)/clubs/_components/reassign-approvals";
import { ToastProvider } from "@/components/ui";
import { reassignApprovalsService, type ReassignApprovalRequest } from "@/lib/services/families";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/lib/services/families", () => ({
  reassignApprovalsService: {
    list: vi.fn(),
    confirm: vi.fn(),
    reject: vi.fn(),
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockedList = vi.mocked(reassignApprovalsService.list);
const mockedConfirm = vi.mocked(reassignApprovalsService.confirm);
const mockedReject = vi.mocked(reassignApprovalsService.reject);
const mockedUseAuth = vi.mocked(useAuth);

const authAs = (role: string) =>
  mockedUseAuth.mockReturnValue({
    user: { id: `${role}-1`, email: `${role}@bgycc.org`, role },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  } as never);

const REQUESTS: ReassignApprovalRequest[] = [
  {
    id: "req-1",
    requested_by: "leader-1",
    requester_name: "Lagos Hub Leader",
    requester_avatar: null,
    club_id: "club-1",
    club_name: "Lagos Hub",
    user_ids: ["u1", "u2"],
    status: "pending",
    created_at: "2026-09-20T10:00:00.000Z",
    reviewed_at: null,
  },
  {
    id: "req-2",
    requested_by: "leader-2",
    requester_name: null,
    requester_avatar: null,
    club_id: "club-2",
    club_name: null,
    user_ids: ["u3"],
    status: "pending",
    created_at: "2026-09-20T11:00:00.000Z",
    reviewed_at: null,
  },
];

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  authAs("admin");
  mockedList.mockReset();
  mockedList.mockResolvedValue({ success: true, data: { requests: REQUESTS } });
  mockedConfirm.mockReset();
  mockedConfirm.mockResolvedValue({
    success: true,
    data: { message: "Request applied", request_id: "req-1", reassigned_ids: [], demoted: [], errors: [] },
  });
  mockedReject.mockReset();
  mockedReject.mockResolvedValue({ success: true, data: { message: "Request rejected", request_id: "req-1" } });
});

const renderQueue = () =>
  render(
    <ToastProvider>
      <ReassignApprovals />
    </ToastProvider>
  );

describe("ReassignApprovals queue", () => {
  it("loads and renders the pending reassign requests with requester, club and member count", async () => {
    renderQueue();

    expect(await screen.findByText("Lagos Hub Leader")).toBeTruthy();
    expect(screen.getByText(/Lagos Hub · 2 members/)).toBeTruthy();
    expect(screen.getByText(/leader-2/)).toBeTruthy();
    expect(screen.getByText(/Unknown club · 1 member/)).toBeTruthy();
  });

  it("approves a request by calling confirm and refetching the queue", async () => {
    const user = userEvent.setup();
    renderQueue();

    await screen.findByText("Lagos Hub Leader");
    const approveButtons = screen.getAllByRole("button", { name: /Approve/ });
    await user.click(approveButtons[0]);

    await waitFor(() => {
      expect(mockedConfirm).toHaveBeenCalledWith("req-1");
    });
    await waitFor(() => {
      expect(screen.getByText(/Reassign request applied/)).toBeTruthy();
    });
    expect(mockedList).toHaveBeenCalledTimes(2);
  });

  it("rejects a request by calling reject and refetching the queue", async () => {
    const user = userEvent.setup();
    renderQueue();

    await screen.findByText("Lagos Hub Leader");
    const rejectButtons = screen.getAllByRole("button", { name: /Reject/ });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(mockedReject).toHaveBeenCalledWith("req-1");
    });
  });

  it("shows an empty state when there are no pending reassign requests", async () => {
    mockedList.mockResolvedValue({ success: true, data: { requests: [] } });
    renderQueue();

    expect(await screen.findByText(/No reassign requests pending approval/)).toBeTruthy();
  });

  it("shows a retry with the error message when loading fails", async () => {
    mockedList.mockRejectedValue(new Error("Failed to load"));
    const user = userEvent.setup();
    renderQueue();

    expect(await screen.findByText(/Failed to load/)).toBeTruthy();

    mockedList.mockResolvedValueOnce({ success: true, data: { requests: REQUESTS } });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    expect(await screen.findByText("Lagos Hub Leader")).toBeTruthy();
  });

  it("renders nothing and does not fetch the admin queue for a leader", async () => {
    authAs("leader");
    renderQueue();

    expect(screen.queryByText("Reassign Approvals")).toBeNull();
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("renders the queue for a super_admin", async () => {
    authAs("super_admin");
    renderQueue();

    expect(await screen.findByText("Reassign Approvals")).toBeTruthy();
    expect(mockedList).toHaveBeenCalledTimes(1);
  });
});