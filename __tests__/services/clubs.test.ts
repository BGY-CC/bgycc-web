import { describe, it, expect, vi, beforeEach } from "vitest";
import { clubsService } from "@/lib/services/clubs";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-clubs";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("clubsService.getStats", () => {
  it("calls GET /clubs/stats", async () => {
    const fetchMock = mockFetch({ stats: { total_clubs: 10 } });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.getStats();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/stats`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("clubsService.search", () => {
  it("calls search with query, page and page_size", async () => {
    const fetchMock = mockFetch({ clubs: [] });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.search("Lagos", 2, 10);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/search?q=Lagos&page=2&page_size=10`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("defaults page=1, page_size=20", async () => {
    const fetchMock = mockFetch({ clubs: [] });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.search("Abuja");

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("page=1");
    expect(url).toContain("page_size=20");
  });
});

describe("clubsService.list", () => {
  it("calls GET /clubs without params when no filters", async () => {
    const fetchMock = mockFetch({ clubs: [] });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.list();

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toBe(`${BASE_URL}/clubs?`);
  });

  it("appends provided filter params", async () => {
    const fetchMock = mockFetch({ clubs: [] });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.list({ state: "Lagos", page: 2, page_size: 10 });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("state=Lagos");
    expect(url).toContain("page=2");
    expect(url).toContain("page_size=10");
  });
});

describe("clubsService.create", () => {
  it("sends POST with club data", async () => {
    const fetchMock = mockFetch({ success: true, data: { id: "new-club" } });
    vi.stubGlobal("fetch", fetchMock);

    const data = { name: "My Club", city: "Ikeja" };
    await clubsService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("clubsService.getDetails", () => {
  it("calls GET /clubs/:id", async () => {
    const fetchMock = mockFetch({ id: "club-1", name: "Lagos Club" });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.getDetails("club-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/club-1`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("clubsService.update", () => {
  it("sends PUT /clubs/:id with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.update("club-1", { name: "Updated Club" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/club-1`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Updated Club" }),
      })
    );
  });
});

describe("clubsService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));

    const result = await clubsService.delete("club-del");
    expect(result).toEqual({ success: true });
  });

  it("parses JSON body on non-204 response", async () => {
    const body = { success: true, message: "Deleted" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(body),
      text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await clubsService.delete("club-del");
    expect(result).toEqual(body);
  });

  it("trims whitespace from id", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.delete("  club-trim  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("club-trim");
    expect(calledUrl).not.toMatch(/\s/);
  });
});

describe("clubsService.getMemberHealth", () => {
  it("calls GET /clubs/:id/member-health", async () => {
    const fetchMock = mockFetch({ demographics: { total: 5 } });
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.getMemberHealth("club-2");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/club-2/member-health`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("clubsService.getTopPerformers", () => {
  it("calls GET /clubs/:id/top-performers with default limit", async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.getTopPerformers("club-3");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/club-3/top-performers?limit=10`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("passes custom limit", async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal("fetch", fetchMock);

    await clubsService.getTopPerformers("club-3", 5);

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("limit=5");
  });
});
