import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuditLogsClient } from "@/app/(dashboard)/audit-logs/_components/audit-logs-client";
import { ToastProvider } from "@/components/ui";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/audit-logs",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    requestOtp: vi.fn(),
    loginWithOtp: vi.fn(),
    updateUser: vi.fn(),
    user: { id: "u1", email: "admin@bgycc.org", role: "admin" },
  }),
}));

const PAGE_SIZE = 20;
const pageBody = (page: number) => ({
  success: true,
  data: {
    audit_logs: [
      { id: `log-${page}`, user_id: null, action: "create", resource_type: "clubs", resource_id: "c1", metadata: { status: 200 }, ip_address: "127.0.0.1", created_at: "2026-09-01T10:00:00.000Z", actor: null },
    ],
    meta: {
      page,
      page_size: PAGE_SIZE,
      total_count: 2500,
      total_pages: 2,
    },
  },
});

const mockFetchPaged = () => {
  const fetchMock = vi
    .fn()
    .mockImplementation((url: string) => {
      const page = new URL(url).searchParams.get("page") ?? "1";
      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(pageBody(Number(page) === 2 ? 2 : 1)),
      });
    });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("bgycc-token", "tok");
});

describe("AuditLogsClient pagination", () => {
  it("always requests real server pagination (page_size=20) and reflects meta totals", async () => {
    const fetchMock = mockFetchPaged();

    render(
      <ToastProvider>
        <AuditLogsClient />
      </ToastProvider>
    );

    await screen.findByText("2,500");

    const url: string = fetchMock.mock.calls[0][0];
    expect(new URL(url).searchParams.get("page")).toBe("1");
    expect(new URL(url).searchParams.get("page_size")).toBe("20");
    expect(url).not.toContain("page_size=100");

    const next = screen.getByRole("button", { name: "Next page" });
    expect((next as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(next);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Page 2" })).toBeTruthy();
    });

    const secondUrl: string = fetchMock.mock.calls[1][0];
    expect(new URL(secondUrl).searchParams.get("page")).toBe("2");
    expect(new URL(secondUrl).searchParams.get("page_size")).toBe("20");
    expect(screen.getByText("2,500")).toBeTruthy();
  });

  it("keeps filtering to a single page when a page size of 100 was previously forced", async () => {
    const fetchMock = mockFetchPaged();

    render(
      <ToastProvider>
        <AuditLogsClient />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).not.toContain("100");

    const fromDate = screen.getByLabelText("From date");
    fireEvent.change(fromDate, { target: { value: "2026-09-01" } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    const filteredUrl: string = fetchMock.mock.calls[1][0];
    expect(new URL(filteredUrl).searchParams.get("page_size")).toBe("20");
    expect(new URL(filteredUrl).searchParams.get("page")).toBe("1");
    expect(filteredUrl).not.toContain("page_size=100");
  });
});