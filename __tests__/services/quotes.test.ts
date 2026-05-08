import { describe, it, expect, vi, beforeEach } from "vitest";
import { quotesService } from "@/lib/services/quotes";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-quotes";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("quotesService.list", () => {
  it("calls GET /quotes", async () => {
    const fetchMock = mockFetch({ quotes: [] });
    vi.stubGlobal("fetch", fetchMock);

    await quotesService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/quotes`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("omits Authorization header when token is absent (lines 18-21)", async () => {
    localStorage.clear();
    const fetchMock = mockFetch({ quotes: [] });
    vi.stubGlobal("fetch", fetchMock);

    await quotesService.list();

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });
});

describe("quotesService.create", () => {
  it("sends POST /quotes with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { content: "Be great!", author: "MLK" };
    await quotesService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/quotes`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("quotesService.update", () => {
  it("sends PATCH /quotes/:id with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await quotesService.update("quote-1", { is_active: false });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/quotes/quote-1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ is_active: false }),
      })
    );
  });
});

describe("quotesService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await quotesService.delete("quote-del");
    expect(result).toEqual({ success: true });
  });

  it("returns parsed JSON for non-204 responses", async () => {
    const body = { success: true, message: "Deleted" };
    vi.stubGlobal("fetch", mockFetch(body, 200));
    const result = await quotesService.delete("quote-del");
    expect(result).toEqual(body);
  });
});
