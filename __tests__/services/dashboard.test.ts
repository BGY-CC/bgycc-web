import { describe, it, expect, vi, beforeEach } from "vitest";
import { dashboardService } from "@/lib/services/dashboard";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-dash";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("dashboardService.getDashboardData", () => {
  it("defaults to 'week' period", async () => {
    const fetchMock = mockFetch({ period: "week" });
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.getDashboardData();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/dashboard?period=week`,
      expect.anything()
    );
  });

  it("accepts 'month' period", async () => {
    const fetchMock = mockFetch({ period: "month" });
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.getDashboardData("month");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/dashboard?period=month`,
      expect.anything()
    );
  });

  it("accepts 'year' period", async () => {
    const fetchMock = mockFetch({ period: "year" });
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.getDashboardData("year");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/dashboard?period=year`,
      expect.anything()
    );
  });

  it("sends Authorization header when token present", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.getDashboardData("week");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });

  it("omits Authorization header when token absent", async () => {
    localStorage.clear();
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.getDashboardData("week");

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });
});

describe("dashboardService.healthCheck", () => {
  it("calls the base admin health endpoint (without /admin suffix)", async () => {
    const fetchMock = mockFetch({ status: "ok" });
    vi.stubGlobal("fetch", fetchMock);

    await dashboardService.healthCheck();

    // BASE_URL is /admin — healthCheck strips /admin and re-adds it
    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toBe(
      "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin"
    );
  });
});
