import { describe, it, expect, vi, beforeEach } from "vitest";
import { announcementsService } from "@/lib/services/announcements";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-123";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
  vi.stubGlobal("fetch", mockFetch({ success: true }));
});

describe("announcementsService.list", () => {
  it("fetches all announcements without clubId", async () => {
    const fetchMock = mockFetch({ announcements: [] });
    vi.stubGlobal("fetch", fetchMock);

    await announcementsService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("fetches filtered announcements with clubId", async () => {
    const fetchMock = mockFetch({ announcements: [] });
    vi.stubGlobal("fetch", fetchMock);

    await announcementsService.list("club-abc");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements?club_id=club-abc`,
      expect.anything()
    );
  });

  it("sends Authorization header when token is present", async () => {
    const fetchMock = mockFetch({ announcements: [] });
    vi.stubGlobal("fetch", fetchMock);

    await announcementsService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });

  it("omits Authorization header when token is absent", async () => {
    localStorage.clear();
    const fetchMock = mockFetch({ announcements: [] });
    vi.stubGlobal("fetch", fetchMock);

    await announcementsService.list();

    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers).not.toHaveProperty("Authorization");
  });
});

describe("announcementsService.create", () => {
  it("sends POST with announcement data", async () => {
    const fetchMock = mockFetch({ success: true, data: { id: "new-id" } });
    vi.stubGlobal("fetch", fetchMock);

    const data = { title: "New Event", type: "event" as const };
    await announcementsService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("announcementsService.update", () => {
  it("sends PUT to the correct announcement URL", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const id = "ann-123";
    const data = { title: "Updated Title" };
    await announcementsService.update(id, data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements/${id}`,
      expect.objectContaining({ method: "PUT", body: JSON.stringify(data) })
    );
  });
});

describe("announcementsService.delete", () => {
  it("sends DELETE to the correct announcement URL", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    const result = await announcementsService.delete("ann-456");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements/ann-456`,
      expect.objectContaining({ method: "DELETE" })
    );
    expect(result).toEqual({ success: true });
  });

  it("returns success: true for 200 response", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await announcementsService.delete("ann-789");
    expect(result).toEqual({ success: true });
  });

  it("trims whitespace from the id", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await announcementsService.delete("  ann-xyz  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("ann-xyz");
    expect(calledUrl).not.toContain("  ");
  });

  it("parses JSON body for non-204/200 responses (lines 73-75)", async () => {
    const body = { success: false, error: "Not found" };
    vi.stubGlobal("fetch", mockFetch(body, 404));

    const result = await announcementsService.delete("ann-404");
    expect(result).toEqual(body);
  });

  it("falls back to { success: false } when json() throws (line 77)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("Not JSON")),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await announcementsService.delete("ann-err");
    expect(result).toEqual({ success: false });
  });
});

describe("announcementsService.uploadImage", () => {
  it("sends multipart POST without Content-Type header", async () => {
    const fetchMock = mockFetch({ success: true, data: { url: "https://cdn.example.com/img.jpg" } });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
    await announcementsService.uploadImage(file);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/community/announcements/upload`,
      expect.objectContaining({ method: "POST" })
    );
    // Content-Type must NOT be set manually for multipart
    const callHeaders = fetchMock.mock.calls[0][1].headers;
    expect(callHeaders).not.toHaveProperty("Content-Type");
  });
});
