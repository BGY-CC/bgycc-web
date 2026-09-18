import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyticsService } from "@/lib/services/analytics";
import { API_CONFIG } from "@/lib/api";

const TOKEN = "test-token-analytics";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(
      typeof body === "string" ? body : JSON.stringify(body)
    ),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("analyticsService.exportCsv", () => {
  it("requests the CSV export for the given period", async () => {
    const fetchMock = mockFetch("metric,value\nactive_members,120\n");
    vi.stubGlobal("fetch", fetchMock);

    await analyticsService.exportCsv("month");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/analytics/export?period=month&format=csv`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("defaults to the current period when none is given", async () => {
    const fetchMock = mockFetch("metric,value\n");
    vi.stubGlobal("fetch", fetchMock);

    await analyticsService.exportCsv();

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("format=csv");
  });
});

describe("analyticsService.getFunnel", () => {
  it("loads the onboarding funnel rows", async () => {
    const fetchMock = mockFetch({
      success: true,
      funnel: [
        { step: "started", count: 100 },
        { step: "completed", count: 58 },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyticsService.getFunnel();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/analytics/funnel`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toEqual([
      { step: "started", count: 100 },
      { step: "completed", count: 58 },
    ]);
  });
});
