import { describe, it, expect, vi, beforeEach } from "vitest";
import { supportService } from "@/lib/services/support";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-support";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("supportService.list", () => {
  it("calls GET /support without status filter", async () => {
    const fetchMock = mockFetch({ tickets: [] });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/support`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("appends status query param when provided", async () => {
    const fetchMock = mockFetch({ tickets: [] });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.list("pending");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/support?status=pending`,
      expect.anything()
    );
  });

  it("includes auth header", async () => {
    const fetchMock = mockFetch({ tickets: [] });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });

  it("omits Authorization header when token is absent (lines 18-21)", async () => {
    localStorage.clear();
    const fetchMock = mockFetch({ tickets: [] });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.list();

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });
});

describe("supportService.getDetails", () => {
  it("calls GET /support/:id", async () => {
    const fetchMock = mockFetch({ id: "ticket-1", status: "pending" });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.getDetails("ticket-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/support/ticket-1`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("supportService.updateStatus", () => {
  it("sends PATCH /support/:id with status body", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await supportService.updateStatus("ticket-1", "resolved");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/support/ticket-1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      })
    );
  });

  it("works for all valid status values", async () => {
    const statuses = ["pending", "acknowledged", "resolved"] as const;

    for (const status of statuses) {
      const fetchMock = mockFetch({ success: true });
      vi.stubGlobal("fetch", fetchMock);

      await supportService.updateStatus("ticket-1", status);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: JSON.stringify({ status }) })
      );
    }
  });
});
