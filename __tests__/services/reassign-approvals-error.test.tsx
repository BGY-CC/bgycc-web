import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReassignApprovals } from "@/app/(dashboard)/clubs/_components/reassign-approvals";
import { ToastProvider } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  mockedUseAuth.mockReturnValue({
    user: { id: "admin-1", email: "admin@bgycc.org", role: "admin" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  } as never);
});

describe("ReassignApprovals list error handling", () => {
  it("renders the error state, not the empty state, when the list request is non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ success: false, error: "Server exploded" }),
      })
    );

    render(
      <ToastProvider>
        <ReassignApprovals />
      </ToastProvider>
    );

    expect(await screen.findByText(/Server exploded/)).toBeTruthy();
    expect(screen.queryByText(/No reassign requests pending approval/)).toBeNull();
  });
});
