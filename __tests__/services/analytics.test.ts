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

describe("analyticsService.getFunnelCsv", () => {
  it("requests the onboarding funnel CSV export", async () => {
    const fetchMock = mockFetch("step,started,completed,drop_rate\n");
    vi.stubGlobal("fetch", fetchMock);

    await analyticsService.getFunnelCsv();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/analytics/funnel?format=csv`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("parses funnel rows from the CSV response", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(
        [
          "step,started,completed,drop_rate",
          "1. Welcome Audio,120,100,16.7",
          "2. Community Call,100,80,20.0",
          "complete,80,58,27.5",
        ].join("\n")
      )
    );

    const csv = await analyticsService.getFunnelCsv();

    expect(csv.rows).toEqual([
      { step: "1. Welcome Audio", started: 120, completed: 100, dropRate: 16.7 },
      { step: "2. Community Call", started: 100, completed: 80, dropRate: 20.0 },
      { step: "complete", started: 80, completed: 58, dropRate: 27.5 },
    ]);
  });

  it("handles quoted step labels containing commas", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(
        [
          "step,started,completed,drop_rate",
          '"1. Welcome, Audio",120,100,16.7',
        ].join("\n")
      )
    );

    const csv = await analyticsService.getFunnelCsv();

    expect(csv.rows[0].step).toBe("1. Welcome, Audio");
    expect(csv.rows[0].started).toBe(120);
  });

  it("throws when the export fails", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 500));

    await expect(analyticsService.getFunnelCsv()).rejects.toThrow();
  });
});
