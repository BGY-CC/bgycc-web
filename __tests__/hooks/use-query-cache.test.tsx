import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import { useEffect } from "react";
import { useQuery, clearQueryCache } from "@/hooks/use-query";

const fetchMock = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    requestOtp: vi.fn(),
    loginWithOtp: vi.fn(),
    updateUser: vi.fn(),
    user: { id: "u1", role: "admin" },
  }),
}));

function Probe({
  onResult,
}: {
  onResult: (result: unknown) => void;
}) {
  const { data } = useQuery<{ name: string }>("/clubs");
  useEffect(() => {
    onResult(data);
  });
  return null;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("bgycc-token", "tok");
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ success: true, data: { name: "Lagos" } }),
  });
  vi.stubGlobal("fetch", fetchMock);
  clearQueryCache();
});

describe("useQuery cache clearing", () => {
  it("serves cached data within the TTL, then refetches after clearQueryCache", async () => {
    const results: unknown[] = [];

    const first = render(<Probe onResult={(r) => results.push(r)} />);
    await waitFor(() => expect(results[results.length - 1]).toEqual({ name: "Lagos" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    first.unmount();
    results.length = 0;
    render(<Probe onResult={(r) => results.push(r)} />);
    await waitFor(() => expect(results[results.length - 1]).toEqual({ name: "Lagos" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => clearQueryCache());
    results.length = 0;
    render(<Probe onResult={(r) => results.push(r)} />);
    await waitFor(() => expect(results[results.length - 1]).toEqual({ name: "Lagos" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});